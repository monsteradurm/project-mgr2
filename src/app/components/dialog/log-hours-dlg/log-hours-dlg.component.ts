import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { Board, BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayIdentity, ScheduledItem } from 'src/app/models/Monday';
import { MondayService } from 'src/app/services/monday.service';
import { TimeEntry } from 'src/app/models/TimeLog';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CalendarItem } from 'src/app/models/Calendar';
const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline',
  'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']

@Component({
  selector: 'app-log-hours-dlg',
  templateUrl: './log-hours-dlg.component.html',
  styleUrls: ['./log-hours-dlg.component.scss']
})
export class LogHoursDlgComponent implements OnInit {

  @Output() HoursUpdated = new EventEmitter<{id: string, entries: TimeEntry[]}>()
  Show: boolean = false;
  Item: BoardItem | ScheduledItem;
  CalendarItem: CalendarItem;

  Entries: TimeEntry[] = [];
  User: MondayIdentity;
  Date: moment.Moment;

  @ViewChild(Dialog, { static: false, read: ElementRef }) DlgContainer;
  constructor(public monday: MondayService, public messenger: MessageService) { }

  OpenDialog(item: BoardItem | ScheduledItem, date: moment.Moment, user: MondayIdentity) {
    if (!user) {
      this.messenger.add({
        severity: 'error',
        summary: 'Invalid "Monday" User',
        detail: 'Cannot View/Edit Time Entries..'
      });
      return;
    }
    this.User = user;
    this.Item = item;
    this.Show = true;
    this.Date = date;
    this.UpdateEntries();
  }

  UpdateEntries(sendEvent?) {
    let ids = _.map([this.Item.id].concat(this.Item.subitem_ids), i => i.toString());


    this.monday.TimeTracking$(ids).subscribe(
      (result) => {
        this.Entries = _.sortBy(result, (r: TimeEntry) => moment(r.date));
        if (sendEvent) {
          this.HoursUpdated.next({id: this.Item.id.toString(), entries: this.Entries});
        }
      }
    )
  }

  CloseDialog() {
    this.Item = null;
    this.Show = false;
  }
  DeleteEntry(index) {

    let entry = this.Entries[index];

    if (entry.isNew)
      this.Entries.splice(index, 1);

    else {
      this.monday.DeleteTimeEntry$(entry).pipe(take(1)).subscribe(
        (result: any) => {
          if (result.delete_update && result.delete_update.id) {
            this.messenger.add({ severity: 'success', summary: 'Removed Time Entry', detail: this.Item.name });
            this.UpdateEntries(true);
          } else {
            this.messenger.add({ severity: 'error', summary: 'Could Not Remove Time Entry', detail: this.Item.name });
          }
        }
      )
    }
  }

  EditEntry(index) {
    let entry = this.Entries[index];
    entry.editing = true;
  }

  AddEntry() {
    if (_.find(this.Entries, e => e.editing)) {
      this.messenger.add({
        severity: 'warn',
        summary: 'An entry is already being edited',
        detail: this.Item.name,
      });
      return;
    }

    let entry = new TimeEntry();
    entry.item = this.Item.id.toString();
    entry.editing = true;
    entry.isNew = true;
    let subitems = this.Item.subitem_ids;

    if (this.Date) {
      entry.date = this.Date.format('YYYY-MM-DD');
    }

    if (subitems && subitems.length > 0) {
      entry.item = subitems[subitems.length - 1].toString();
    }

    this.Entries.push(entry);
  }

  Validate() {

  }

  ngOnInit(): void {
  }
}
