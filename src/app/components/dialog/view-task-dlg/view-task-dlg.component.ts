import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionButton, ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest, EMPTY, from, Observable, of } from 'rxjs';
import { catchError, concatMap, delay, distinctUntilChanged, map, mergeMap, shareReplay, skipUntil, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import { Board, BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { BoxService } from 'src/app/services/box.service';
import { MondayService } from 'src/app/services/monday.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { Dialog } from 'primeng/dialog'
import * as _ from 'underscore';
import { MessageService } from 'primeng/api';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Identity } from '@fullcalendar/common';
import { FileUpload } from 'primeng/fileupload'
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { ProjectService } from 'src/app/services/project.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ConfluenceService } from 'src/app/services/confluence.service';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit, OnDestroy {
  Show: boolean = false;
  contextMenuTop;
  contextMenuLeft;
  @ViewChild(MatMenu, { static: false }) statusMenu: MatMenu;
  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;

  @ViewChild('fileInput') fileInput: FileUpload;
  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.onResize(null);
  }

  HeightRequested() {
    this.onResize(null);
  }
  height = new BehaviorSubject<number>(0);

  Height$ = this.height.asObservable();
  TaskHeight$ = this.Height$.pipe(
    map(h => h - 40)
  )
  
  onResize(evt) {
    if (!this.DlgContainer)
      return;

    let el = this.DlgContainer.nativeElement as HTMLElement;

    if (!el) return;

    let dlg = el.firstElementChild.firstElementChild;
    let result = dlg.clientHeight;
    if (result < 20)
      result = 20;

    this.height.next(result);
  }

  _Item;
  @ViewChild(Dialog, { static: false, read: ElementRef }) DlgContainer;

  //REQUIRED INPUTS
  //Item
  User: UserIdentity;
  OpenDialog(Item: BoardItem, User: UserIdentity) {
    this.Item = Item;
    this.User = User;
    this.SelectedSubItem = this.Item.subitem_ids.length > 0 ?
      this.Item.subitem_ids[this.Item.subitem_ids.length - 1] : this.Item.id;
    this.Show = true;
    this.onResize(null);
  }


  constructor(private monday: MondayService,
    private el: ElementRef,
    private syncSketch: SyncSketchService,
    private box: BoxService,
    private projectService: ProjectService,
    private confluence: ConfluenceService,
    private sanitizer: DomSanitizer,
    private firebase: FirebaseService,
    private afs: AngularFirestore,
    private messager: MessageService,
    private actionOutlet: ActionOutletFactory) { }

  item = new BehaviorSubject<BoardItem>(null);
  
  private refreshView = new EventEmitter<boolean>(true);
  ViewMenu;

  RefreshView$ = this.refreshView.asObservable().pipe(shareReplay(1))
  Item$ = this.item.asObservable().pipe(shareReplay(1))
  
  selectedUploadType = "Default";
  SelectedSubItem;
  SyncReview$ = this.Item$.pipe(
    switchMap(Item => Item ?
      this.syncSketch.FindReview$(Item) : of(null)),
    switchMap((review:any) => {
      if (review)
        return of(review);
      
      let name = this.Item.board.id + '_' + this.Item.group.title + '/' + this.Item.element;
      return this.SyncBoard$.pipe(
        //map(result =>{  throw "CREATING BOARD / ERROR ON PURPOSE" })
        switchMap((project:any) => this.syncSketch.CreateReview(project.id, name)),
      )
    }),
    tap(t => this.onResize(null)),
    shareReplay(1),
  )

  set Item(s: BoardItem) {
    this._Item = s;
    this.item.next(s);
  }

  get Item() { return this._Item; }


  onReferenceSelected(department) {
    department.ReferenceFolder$ = this.ReferenceFolder$(department.text);
    this.SelectedSubItem = department.id;
  }
  private referenceError = new BehaviorSubject<string>(null); 
  ReferenceError$ = this.referenceError.asObservable().pipe(
    tap(t => console.log("REFERENCE ERROR: ", t)),
    shareReplay(1)
    );

  ReferenceFolder$(department) {
    return this.Item$.pipe(
      switchMap(item => {
        let key = item.workspace.name.split('_')[0];
        let path = item.board.name.indexOf('/') > -1 ?
          item.board.name.split('/') : [item.board.name];

        path.push(item.group.title);
        path.push(item.element);
        path.push(department);

        return this.confluence.BoxRoot$(key).pipe(
          tap(t => console.log(t)),
          switchMap(root => this.box.ReferenceFolder$(root)),
          //switchMap(folder => this.box.GetFolder$(folder.id)),
          switchMap(folder => this.box.FindNestedFolder(path, folder.id, true)),
          take(1)
        )
        }),
      
      catchError(err => {
        this.referenceError.next(err);
        return of(null);
      })
    )
  }
  ViewMenu$ = this.Item$.pipe(
    map(item => {
      this.ViewMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('playlist_add');
      let AddRevision = this.ViewMenu.createGroup().enableDropdown().setTitle('Add Review');
      let AddInternalFeedbackButton: ActionButton = AddRevision.createButton().setTitle('Internal');
      AddInternalFeedbackButton.fire$.subscribe(
        (a) => this.AddReview("Internal")
      )
      let AddClientFeedbackButton: ActionButton = AddRevision.createButton().setTitle('Client');

      AddClientFeedbackButton.fire$.subscribe(
        (a) => this.AddReview("Client")
      )
      return this.ViewMenu
    }),
    shareReplay(1)
  )

  UpdateItem(setSelected?) {
    let item_id = this.Item.id;
    let group_id = this.Item.group.id;
    let board_id = this.Item.board.id;
    let workspace_id = this.Item.workspace.id;

    //this.firebase.SendBoardItemUpdate(board_id, group_id, item_id);
    this.monday.GetBoardItem$(board_id, group_id, item_id).pipe(
      take(1)
    ).subscribe(item => {
      this.Item = new BoardItem(item, this.Item.workspace, this.Item.group, this.Item.board)
      if (setSelected) {
        this.SelectedSubItem = setSelected;
      }
    })
  }
  Refresh() {
    this.onResize(null);
    this.UpdateItem();
  }

  AddReview(type: "Internal" | "Client") {
    let id = this.Item.id;
    of(this.Item).pipe(
      switchMap(item => this.Item.subitem_ids.length < 1 ?
        of([]) : this.monday.SubItems$(item.subitem_ids)
      ),
      map(subitems => _.filter(subitems, s => s.name.indexOf(type) > -1)),
      map(subitems => type + " Feedback #" + String(subitems.length + 1).padStart(2, '0')),
      switchMap(name => this.monday.CreateSubItem$(id, name))
    ).pipe(take(1)).subscribe(
      (result: any) => {
        let name: string = result.name
        if (result && result.create_subitem && result.create_subitem.id) {

          let subitem = result.create_subitem;
          this.UpdateItem(result.id);
          this.messager.add({
            severity: 'success',
            summary: 'Created Review "' + subitem.name + '"',
            life: 3000,
            detail: this.Item.name,
          });
        } else {
          this.messager.add({
            severity: 'error',
            summary: 'Could Not Create Review',
            life: 3000,
            detail: this.Item.name,
          })
        }

      })
  }


  DeleteSubItem(subitem) {
    let setSelected;
    let index = _.findIndex(this.Item.subitem_ids, i => i == subitem.id);

    if (index > 0 && this.Item.subitem_ids.length > 1)
      setSelected = this.Item.subitem_ids[index - 1];
    else
      setSelected = this.Item.id;


    this.SyncReview$.pipe(
      tap(t => console.log("SYNC REVIEW!?", t)),
      switchMap(review => this.syncSketch.Items$(review.id)),
      map(items => _.filter(items, i => i.name.indexOf(subitem.name > -1))),
      switchMap(items => items.length > 0 ?
        this.syncSketch.RemoveItems$(_.map(items, i => i.id))
        : of(null)),
      switchMap(() => this.monday.DeleteBoardItem$(subitem.id)),
      catchError(err => {
        this.messager.add({
          severity: 'error',
          summary: 'Could Not Delete Review',
          life: 3000,
          detail: this.Item.name,
        })
        return of(null);
      })
    ).pipe(take(1)).subscribe(
      (result: any) => {
        if (result.delete_item && result.delete_item.id) {
          this.UpdateItem(setSelected);
          this.messager.add({
            severity: 'success',
            summary: 'Deleted Review "' + subitem.name + '"',
            life: 3000,
            detail: this.Item.name,
          });
        } else {
          this.messager.add({
            severity: 'error',
            summary: 'Could Not Delete Review',
            life: 3000,
            detail: this.Item.name,
          })
        }

      }
    )
  }
  UploadURL$: Observable<string>;
  onSelect(event) {

  }

  StatusOptions = []

  EditStatus() {

    this.projectService.GetStatusOptions$(this.Item.board.id).pipe(take(1)).subscribe((options) => {
      this.StatusOptions = options;
      this.contextMenuTrigger.openMenu();
    });
  }

  onSetStatus(column) {
    this.projectService.SetItemStatus(this.Item.board.id, this.Item, column).pipe(take(1)).subscribe((result) => {})

    this.Item.status['additional_info']['color'] = column.color;
    this.Item.status['additional_info']['label'] = column.label;
    this.Item.status['text'] = column.label;
    this.Item = JSON.parse(JSON.stringify(this.Item));
  }
  public SizeToUpload: number;
  public FileToUpload: string;
  public UploadProgress: number;
  public UploadStatus: string = "Ready";
  public TypeToUpload: string;
  
  OnSelectedFile(evt) {
    this.selectedUploadType = "Default";
    let file = evt.currentFiles[0];
    this.SizeToUpload = Math.round(file.size / 1024 / 10.24) / 100 ;
    this.FileToUpload = file.name;
    this.TypeToUpload = file.type;
  }

  Upload$(review, subitem, file, description) {
    let reviewId = review.reviewid ? review.reviewid : review.id;
    if (!reviewId) {
      this.messager.add({
        severity : 'error', detail : 'The review Id could not be found for processing!', summary: 'Unable to Upload!'
      })
      throw 'Could not find Review Id'
    }
    let url = this.syncSketch.UploadURL(review.reviewid ? review.reviewid : review.id, this.selectedUploadType);
    this.messager.add({
      severity: 'info',
      detail: subitem.name,
      summary: 'Uploading Content..',
    });

    return of(this.User).pipe(
      switchMap(user => {
        let data = new FormData();
        data.append('artist', user.displayName);
        data.append('reviewFile', file, file.name);
        data.append('description', subitem.name);
        this.UploadStatus = "Starting";

        return this.syncSketch.Upload$(url, data)
      }),
      map(event => {
        console.log(event);
        try {
          this.fileInput.progress = Math.round(event['loaded'] * 100 / event['total']);
          this.UploadProgress = this.fileInput.progress;

          if (this.fileInput.progress >= 100) {
            this.UploadStatus = "Processing";
            this.messager.add({severity: 'info', summary: 'Uploaded. Processing Item.', detail: subitem.name})
          }

        } catch { }

        switch (event.type) {
          case HttpEventType.Response: {
            if (event.status == 200) 
              return event;
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.log("ERROR", error);
        this.messager.add({
          severity: 'error',
          summary: 'Upload Failed.',
          detail: subitem.name,
          life: 3000
        })
        return of(null);
      })
    )
  }

  Board$ = this.Item$.pipe(
    switchMap(item =>
      this.projectService.Boards$.pipe(
        map(boards => _.find(boards, b => b.id == item.board.id))
      )
    ),
    shareReplay(1)
  )

  Settings$ = this.Item$.pipe(
    map(item => item.workspace.id),
    switchMap(workspaceId => this.projectService.GetProjectSettings$(workspaceId)),
    shareReplay(1)
  )

  Departments$ = this.Board$.pipe(
    switchMap(board => board ? this.monday.GetTags$(board.id) : [])  
        )
  /*
  ProjectReference$ = this.Settings$.pipe(

    map(
      settings => {
        if (!settings || !settings['Box Folders'])
          return null;

        let ref =  _.find(settings['Box Folders'], s => s.name == 'Reference');

        if (!ref || !ref.column_values || ref.column_values.length < 1) return null;
        return ref.column_values[0].text;
      }
    )
  )*/

  SyncBoard$ = this.Board$.pipe(
    switchMap(board => this.syncSketch.Project$(board)),
    tap(console.log),
    switchMap((syncBoard:any) => {
      if (syncBoard)
        return of(syncBoard);

      return this.Board$.pipe(
          switchMap(board => this.syncSketch.CreateProject(board.selection))
      )
    }),
    tap(t => this.onResize(null)),
    shareReplay(1)
  )

  handleUploads(event, subitem) {
    let project = this.Item.workspace.name + ', ' + this.Item.board.name;
    let name = this.Item.board.id + '_' + this.Item.group.title + '/' + this.Item.element;
    let file = event.files[0];
    let description = name + '\n' + this.Item.department_text + '\n' +
      this.Item.task + '\n' + subitem.name;

    this.SyncReview$.pipe(
      switchMap(review => {
        if (!review) {
          this.messager.add({severity: 'error', summary: 'Could not find syncSketch Review!', detail: 'Could not upload!' });

          throw 'Could not upload'
        }

        return this.SyncBoard$
          .pipe(
            switchMap((project: any) => review ? of(review) :
              this.syncSketch.CreateReview(project.id, name))
          )
      }),
      take(1)
    ).subscribe((review:any) => {
      let id = review.reviewid ? review.reviewid : review.id;
      if (!id) {
        this.messager.add({severity: 'error', summary: ' Could not process upload!', 
        detail: 'Could not find review id for processing'})
      }

      this.Upload$(review, subitem, file, description).pipe(
        skipWhile(result => !result),
        switchMap(() => this.syncSketch.Items$(id)),
        tap(t => console.log("Uploaded File", t, file)),
        map((items) => _.find(items, i => file.name.toLowerCase().indexOf(
          i.name.toLowerCase())
          == 0)
        ),
        tap(t => this.UploadStatus = 'Ready'),
        switchMap(item => this.syncSketch.RenameItem$(item.id,
          subitem.id + '_' + this.Item.task + '/' + subitem.name + '/' + file.name, 
            this.selectedUploadType)
        ),
        tap(t => console.log("Renamed File", t)),
        switchMap(r => this.SyncReview$),
        tap( t=> this.syncSketch.PostReviewUpdate(this.Item, t.reviewid ? t.reviewid : t.id))
      ).subscribe(result => {
        this.fileInput.clear();
        this.UploadStatus = 'Ready';
        this.messager.add({
          severity: 'success',
          detail: subitem.name,
          summary: "File Upload Complete."
        })
      })
    })
  }




  subscriptions = [];
  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
