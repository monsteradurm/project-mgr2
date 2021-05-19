import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, timestamp } from 'rxjs/operators';
import { CalendarItem } from 'src/app/models/Calendar';
import { TimeEntry } from 'src/app/models/TimeLog';
import * as _ from 'underscore';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.scss']
})
export class AllocationComponent implements OnInit {

  @HostListener('mouseenter', ['$event']) onMouseEnter(evt) {
    this.IsMouseOver = true;
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(evt) {
    this.IsMouseOver = false;
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    this.IsMouseOver = true;
  }

  IsMouseOver: boolean = false;
  constructor(public element: ElementRef) { }

  private _Event = new BehaviorSubject<CalendarItem>(null);
  private _Date = new BehaviorSubject<moment.Moment>(null);
  private _Height = new BehaviorSubject<number>(67);
  private _LogUpdate = new BehaviorSubject<TimeEntry[]>(null);

  LogUpdate$ = this._LogUpdate.asObservable().pipe(shareReplay(1));
  Event$ = this._Event.asObservable().pipe(shareReplay(1));
  Date$ = this._Date.asObservable().pipe(shareReplay(1));

  __Event: CalendarItem;
  __Date: moment.Moment;
  __Height: number;

  set Event(c: CalendarItem) {
    this.__Event = c;
    this._Event.next(c);
  }

  set date(d: moment.Moment) {
    this.__Date = d;
    this._Date.next(d);
  }

  set Height(h:number) {
    this.__Height = h;
    this._Height.next(h);
  }

  get Date() { return this.__Date; }
  get Event() { return this.__Event; }

  height: number = 67;
  primaryColor: string;

  
  Logs$ = combineLatest([this.Event$.pipe(timestamp()), this.LogUpdate$.pipe(timestamp()), this.Date$]).pipe(
    map(([evt, update, date]) => {
      let logs;
      if (!evt.value || !date)
        return [];

      if (!update.value || update.timestamp < evt.timestamp)
        logs = evt.value.extendedProps.logs;
      else{
        logs = update.value;
      }

      
    return _.filter(logs,
          (l:TimeEntry) => moment(l.date).isSame(date, 'day'))
    })
  )

  SetLogs(logs: TimeEntry[]) {
    this._LogUpdate.next(logs);
  }

  Height$ =
    combineLatest([this.Logs$, this._Height.asObservable()]).pipe(
      map(([logs, height]) => {
        return this.__Height + (logs.length * 35) + 20;
      }),
      shareReplay(1)
    );

  ngOnInit(): void {
  }

}
