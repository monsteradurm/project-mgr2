import { Component, HostListener, Input, OnInit } from '@angular/core';
import { rangesEqual } from '@fullcalendar/common';
import * as moment from 'moment';
import * as _ from 'underscore';

import { MondayIdentity } from 'src/app/models/Monday';
import { TimeEntry } from 'src/app/models/TimeLog';
import { LogHoursDlgComponent } from '../log-hours-dlg.component';

@Component({
  selector: 'app-time-entry',
  templateUrl: './time-entry.component.html',
  styleUrls: ['./time-entry.component.scss']
})
export class TimeEntryComponent implements OnInit {

  HourOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  MinuteOptions = ['00', '15', '30', '45'];

  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    evt.preventDefault();
  }

  @Input() User: MondayIdentity
  @Input() Entry: TimeEntry;
  @Input() Status: { color: any, label: string }
  @Input() Index;
  Edit = new NewLog()
  get Item() { return this.parent.Item; }
  constructor(private parent: LogHoursDlgComponent) { }

  onEdit(date?:moment.Moment) {
    if (_.find(this.parent.Entries, e => e.editing || e.isNew)) {
      this.parent.messenger.add({
        severity: 'warn',
        summary: 'An entry is already being edited',
        detail: this.Item.name,
      });
      return;
    }
    else 
      this.Entry.editing = true;
  }

  onDelete() {
    if (this.Entry.editing && !this.Entry.isNew)
      this.Entry.editing = false;
    else
      this.parent.DeleteEntry(this.Index);
  }

  onSubmit() {
    let e = this.Edit;
    let start = e.start ? e.start : (this.parent.Date ? this.parent.Date : moment());
    let date = moment(`${start.format('YYYY-MM-DD')} ${e.hour}:${e.minute} ${e.half}`, 'YYYY-MM-DD HH:mm A')

    let duration = parseInt(e.duration_hours);
    duration += parseInt(e.duration_minutes) / 60;

    this.Entry.date = date.toString();
    this.Entry.duration = duration;
    this.Entry.user = this.User.id.toString();

    let obs = this.Entry.isNew ? this.parent.monday.CreateTimeEntry$(this.Entry) :
    this.parent.monday.UpdateTimeEntry$(this.Entry);
    obs.subscribe((result:any) => {
      if (!result || !result.create_update || !result.create_update.id) {
        this.parent.messenger.add({ severity: 'error', summary: 'Could Not Add Time Entry', detail: this.Item.name})
        return;
      }
      this.parent.messenger.add({ severity: 'success', summary: 'Added Time Entry', detail: this.Item.name});
      this.parent.UpdateEntries(true);
    })
  }

  get selectedDate() { return this.parent.Date}

  ngOnInit(): void {
  }

}


class NewLog {
  start: moment.Moment;
  hour: string = '09';
  minute: string = '00';
  half: string = 'AM';

  duration_hours: string = '01';
  duration_minutes: string = '00';

  revision: string;
}
