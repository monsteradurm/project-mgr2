import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { MondayService } from 'src/app/services/monday.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit {
  Show: boolean = false;
  @Output() VisibilityChanged = new EventEmitter<boolean>(false);
  @Input() primaryColors; 

  constructor(private monday: MondayService) { }

  item = new BehaviorSubject<BoardItem | ScheduledItem>(null);
  Item$ = this.item.asObservable().pipe(shareReplay(1))
  SelectedSubItem = null;
  
  _Item;
  @Input() set Item(s: BoardItem | ScheduledItem) {
    this._Item = s;
    this.item.next(s);

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
  }

  get Item() { return this._Item; }

  SubItems$ = this.Item$.pipe(
    switchMap(item => item && item.subitem_ids && item.subitem_ids.length > 0 ?
      this.monday.SubItems$(item.subitem_ids) : of([])),
    map(subitems => _.map(subitems.reverse(), s=> new SubItem(s))),
    shareReplay(1)
  )
  
  View$ = combineLatest([this.Item$, this.SubItems$]).pipe(
    map(([item, subitems]) => {
      if (!subitems || subitems.length < 1 || this.SelectedSubItem == item.id)
        return item;

      return _.find(subitems, s => s.id == this.SelectedSubItem);
    }),
    shareReplay(1)
  )
  ngOnInit(): void {
  }

}
