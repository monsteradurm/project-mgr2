import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  Show: boolean = false;

  @Output() onClose = new EventEmitter<boolean>(false);
  @Input() primaryColors; 

  constructor(private monday: MondayService, 
    private syncSketch: SyncSketchService,
    private actionOutlet: ActionOutletFactory) { }

  item = new BehaviorSubject<BoardItem | ScheduledItem>(null);

  private refreshView = new EventEmitter<boolean>(true);
  ViewMenu;

  RefreshView$ = this.refreshView.asObservable().pipe(shareReplay(1))
  Item$ = this.item.asObservable().pipe(shareReplay(1))

  private _selectedSubItem = null;
  set SelectedSubItem(s) {
    this._selectedSubItem = s;
    this.refreshView.next(true);
  };
  
  get SelectedSubItem() { return this._selectedSubItem; }

  @Input() SyncReview$: Observable<any>;
  _Item;
  @Input() set Item(s: BoardItem | ScheduledItem) {
    this._Item = s;
    if (s) {
      this.Show = true;
      if (!this.Item.subitem_ids || this.Item.subitem_ids.length < 1)
        this.SelectedSubItem = this.Item.id;
      else 
        this.SelectedSubItem = this.Item.subitem_ids[this.Item.subitem_ids.length - 1]
    }
    else {
      this.Show = false;
      this.item.next(null);
      this.SelectedSubItem = null;
    }
    this.item.next(s);
  }

  Closing() { 
    this.onClose.next(true);
  }
  get Item() { return this._Item; }

  SubItems$ = this.Item$.pipe(
    switchMap(item => item && item.subitem_ids && item.subitem_ids.length > 0 ?
      this.monday.SubItems$(item.subitem_ids) : of([])),
    map(subitems => _.map(subitems.reverse(), s=> new SubItem(s))),
    shareReplay(1)
  )
  
  View$ = combineLatest([this.Item$, this.SubItems$, this.RefreshView$]).pipe(
    map(([item, subitems]) => {
      if (!subitems || subitems.length < 1 || this.SelectedSubItem == item.id || !this.SelectedSubItem)
        return item;

      return _.find(subitems, s => s.id == this.SelectedSubItem);
    }),
    shareReplay(1)
  )
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
  SyncViewItems$;
  ngOnInit(): void {
    this.SyncViewItems$ = combineLatest([this.View$, this.Item$, this.SyncReview$]).pipe(
        switchMap(([view, item, review]) => review && item && view ? 
          this.syncSketch.Items$(review.id).pipe(
            map((items:any[]) =>
              _.filter(items, i => {
                let nameArr = i.name.split('/');
                let department = nameArr[0];
                let validDepartment = _.filter(item.department_text, d => department.indexOf(d) > -1).length > 0;
                if (!validDepartment)
                  return false;
                if (view.task != nameArr[1])
                  return false;

                i['review'] = review.reviewURL + i.id;
                return true;
              })
            )
          ) : of([]))
      );
  }

}
