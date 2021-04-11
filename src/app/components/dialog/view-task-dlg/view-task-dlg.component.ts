import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
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
  @Input() primaryColors; 

  constructor(private monday: MondayService, 
    private syncSketch: SyncSketchService,
    private sanitizer : DomSanitizer,
    private actionOutlet: ActionOutletFactory) { }

  item = new BehaviorSubject<BoardItem | ScheduledItem>(null);

  private refreshView = new EventEmitter<boolean>(true);
  ViewMenu;

  RefreshView$ = this.refreshView.asObservable().pipe(shareReplay(1))
  Item$ = this.item.asObservable().pipe(shareReplay(1))

  SelectedSubItem;
  
  @Input() SyncReview$: Observable<any>;

  _Item;
  @Input() set Item(s: BoardItem | ScheduledItem) {
    this._Item = s;
    this.item.next(s);
  }
  
  Closing() { 
    this.onClose.next(true);
  }

  get Item() { return this._Item; }

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
