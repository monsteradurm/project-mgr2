import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Board, BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { BoxService } from 'src/app/services/box.service';
import { MondayService } from 'src/app/services/monday.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { Dialog } from 'primeng/dialog'
import * as _ from 'underscore';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit {
  Show: boolean = true;

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
  @ViewChild(Dialog, {static: false, read: ElementRef}) DlgContainer;
  
  constructor(private monday: MondayService, 
    private el: ElementRef,
    private syncSketch: SyncSketchService,
    private box: BoxService,
    private sanitizer : DomSanitizer,
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

  @Input() Departments: string[]
  
  get Item() { return this._Item; }
  /*
  BoxFolder$ = combineLatest([this.ProjectReference$, this.Item$]).pipe(
    switchMap(([anscestor, item]) => {
      if (!item || !anscestor) return of(null);

      return this.box.FindNestedFolder(item, anscestor, false);
    })
    )
  */
  SyncReviewItems$

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
      let AddRevision = this.ViewMenu.createGroup().enableDropdown().setTitle('Add Revision');
      let AddInternalFeedbackButton = AddRevision.createButton().setTitle('Internal');
      let AddClientFeedbackButton = AddRevision.createButton().setTitle('Client');
      return this.ViewMenu
    }),
    shareReplay(1)
  )

  NewTab(url) {
    window.open(url, "_blank");
  }

  ngOnInit(): void {
  }

}
