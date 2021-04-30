import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionButton, ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs';
import { catchError, delay, map, shareReplay, skipUntil, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import { Board, BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { BoxService } from 'src/app/services/box.service';
import { MondayService } from 'src/app/services/monday.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { Dialog } from 'primeng/dialog'
import * as _ from 'underscore';
import { MessageService } from 'primeng/api';
import { SocketService } from 'src/app/services/socket.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Identity } from '@fullcalendar/common';
import { FileUpload } from 'primeng/fileupload'
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit {
  Show: boolean = true;
  contextMenuTop;
  contextMenuLeft;
  @ViewChild('fileInput') fileInput: FileUpload; 
  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.onResize(null);
  }

  @Output() TaskHeight;
  @Output() FetchHeight;

  onResize(evt) {
    if (!this.DlgContainer)
      return;

    let el = this.DlgContainer.nativeElement as HTMLElement;
    let dlg = el.firstElementChild.firstElementChild;
    this.Height = dlg.clientHeight;
    this.TaskHeight = this.Height - 40;
  }


  @Output() Height;
  @Output() onClose = new EventEmitter<boolean>(false);
  @Input() primaryColor;
  @ViewChild(Dialog, { static: false, read: ElementRef }) DlgContainer;

  constructor(private monday: MondayService,
    private el: ElementRef,
    private syncSketch: SyncSketchService,
    private box: BoxService,
    private sanitizer: DomSanitizer,
    private socket: SocketService,
    private messager: MessageService,
    private actionOutlet: ActionOutletFactory) { }

  item = new BehaviorSubject<BoardItem>(null);
  projectReference = new BehaviorSubject<string>(null);

  private refreshView = new EventEmitter<boolean>(true);
  ViewMenu;

  RefreshView$ = this.refreshView.asObservable().pipe(shareReplay(1))
  Item$ = this.item.asObservable().pipe(shareReplay(1))
  ProjectReference$ = this.projectReference.asObservable().pipe(shareReplay(1))

  SelectedSubItem;

  @Input() SyncReview$: Observable<any>;
  @Input() SyncBoard: any;
  @Input() User: UserIdentity;
  _Item;
  @Input() set Item(s: BoardItem) {
    this._Item = s;
    this.item.next(s);
  }

  @Input() set ProjectReference(s: string) {
    this.projectReference.next(s);
    this.onResize(null);
  }

  Closing() {
    this.onClose.next(true);
  }

  @Input() Departments: any[]

  get Item() { return this._Item; }


  onReferenceSelected(department) {
    department.ReferenceFolder$ = this.ReferenceFolder$(department.text);
    this.SelectedSubItem = department.id;
  }

  ReferenceFolder$(department) {
    return combineLatest([this.ProjectReference$, this.Item$]).pipe(
      switchMap(([anscestor, item]) => {
        if (!item || !anscestor) return of(null);

        let path = item.board.name.indexOf('/') > -1 ?
          item.board.name.split('/') : [item.board.name];

        path.push(item.group.title);
        path.push(item.element);
        path.push(department);

        return this.box.FindNestedFolder(path, anscestor, true);
      })
    ).pipe(take(1))
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

    this.socket.SendBoardItemUpdate(board_id, group_id, item_id);
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
            summary: 'Deleeted Review "' + subitem.name + '"',
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

  Upload$(review, subitem, file, description) {
    let url = this.syncSketch.UploadURL(review.id);
    this.fileInput.showUploadButton = false;
    this.messager.add( {
      severity: 'info',
      detail: subitem.name,
      summary: 'Uploading Content..',
    });
    
    return of(this.User).pipe(
      switchMap(user => {
        console.log(user);
        let data = new FormData();
        data.append('artist', user.displayName);
        data.append('reviewFile', file, file.name);
        data.append('description', subitem.name);
        return this.syncSketch.Upload$(url, data)
      }),
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            this.fileInput.progress = Math.round(event.loaded * 100 / event.total);
            break;
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

  handleUploads(event, subitem) {
    let project = this.Item.workspace.name + ', ' + this.Item.board.name;
    let name = this.Item.group.title + '/' + this.Item.element;
    let file = event.files[0];
    let description = name + '/' + subitem.name;

    this.SyncReview$.pipe(
      switchMap(review => {
        return of(null)
          .pipe(
            switchMap(() => this.SyncBoard ? of(this.SyncBoard) :
              this.syncSketch.CreateProject(project)),
            switchMap((project) => review ? of(review) :
              this.syncSketch.CreateReview(project.id, name))
          )
      }),
      take(1)
    ).subscribe((review) => {
      this.Upload$(review, subitem, file, description).pipe(
        skipWhile(result => !result),
        switchMap(() => this.syncSketch.Items$(review.id)),
        map((items) => _.find(items, i => i.name + i.extension == file.name)),
        switchMap(item => this.syncSketch.RenameItem$(item.id, 
          this.Item.department_text + '/' + subitem.name + '/' + file.name)
        )
      ).subscribe(result => {
        this.fileInput.clear();
        this.UpdateItem(null)
        this.messager.add({
          severity: 'success',
          detail: subitem.name,
          summary: "File Uploaded."
        })
      })
    })
  }


  NewTab(url) {
    window.open(url, "_blank");
  }

  subscriptions = [];
  ngOnInit(): void {
  }

}
