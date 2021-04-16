import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Board, BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { BoxService } from 'src/app/services/box.service';
import { MondayService } from 'src/app/services/monday.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit {
  Show: boolean = true;

  @Output() onClose = new EventEmitter<boolean>(false);
  @Input() primaryColor; 

  constructor(private monday: MondayService, 
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
  }

  Closing() { 
    this.onClose.next(true);
  }

  get Item() { return this._Item; }
  BoxFolder$ = combineLatest([this.ProjectReference$, this.Item$]).pipe(
    switchMap(([anscestor, item]) => {
      console.log("BOX FOLDER A", anscestor, item);
      if (!item || !anscestor) return of(null);

      return this.box.FindReference(item, anscestor, true);
    })
    ).subscribe(t => console.log("BOX FOLDER", t))
    
  SyncReviewItems$

  ViewMenu$ = this.Item$.pipe(
    map(item => {
      this.ViewMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('menu_open');
      let SiblingsButton = this.ViewMenu.createButton().setTitle('Switch Department');
      let AddButton = this.ViewMenu.createGroup().enableDropdown().setTitle('Add Group...');
      let AddFeedbackButton = AddButton.createGroup().enableDropdown().setTitle('Revisions')
      let AddInternalFeedbackButton = AddFeedbackButton.createButton().setTitle('Internal');
      let AddClientFeedbackButton = AddFeedbackButton.createButton().setTitle('Client');
      let AddReferenceButton = AddButton.createGroup().enableDropdown().setTitle('Reference');
      let AddInternalReference = AddReferenceButton.createButton().setTitle('Internal');
      let AddClientReference = AddReferenceButton.createButton().setTitle('Client');
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
