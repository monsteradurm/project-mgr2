import { Component, ElementRef, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CalendarItem } from 'src/app/models/Calendar';
import { TimeEntry } from 'src/app/models/TimeLog';
import * as _ from 'underscore';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.scss']
})
export class AllocationComponent implements OnInit {

  constructor(public element: ElementRef) { }

  private _Event = new BehaviorSubject<CalendarItem>(null);
  private _Date = new BehaviorSubject<moment.Moment>(null);
  private _Height = new BehaviorSubject<number>(67);

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

  Logs$ = combineLatest([this.Event$, this.Date$]).pipe(
    map(([evt, date]) => {
      console.log(evt, date);
      if (!evt || !date || !evt.extendedProps.subitems || evt.extendedProps.subitems.length < 1)
        return [];

    return _.filter(evt.extendedProps.logs, 
          (l:TimeEntry) => moment(l.date).isSame(date, 'day'))
    })
  )

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
