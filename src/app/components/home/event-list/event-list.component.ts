import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { HomeComponent } from '../home.component';
import listPlugin from '@fullcalendar/list';
import { CalendarItem, CalendarLog, CalendarProperties } from 'src/app/models/Calendar';
import * as _ from 'underscore';
import * as moment from 'moment';
import { TimeEntry } from 'src/app/models/TimeLog';
import { Calendar, compareByFieldSpec } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LogComponent } from '../../tooltips/log/log.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  listPlugin = [listPlugin]
  constructor(private parent: HomeComponent) { }

  _ViewMode = new BehaviorSubject<string>(null);
  ViewMode$ = this._ViewMode.asObservable().pipe(shareReplay(1));

  Logs$ = this.parent.Allocations$.pipe(
    map((allocations: CalendarItem[]) => _.map(allocations, a => a.extendedProps)),
    switchMap((allocations: CalendarProperties[]) => {
      let ids = _.map(allocations, a=> a.id);
      return this.parent.monday.TimeTracking$(ids).pipe(
        map((logs:TimeEntry[]) => _.map(logs, 
          (l:TimeEntry) => {
            
            let allocation = _.find(allocations, 
              (a:CalendarProperties) => a.id.toString() == l.item.toString() ||
                (a.subitems && _.map(a.subitems, (sub) => sub.id.toString()).indexOf(l.item.toString()) > -1)
              )
            return new CalendarLog(l, allocation);
        }))
      )
    }),
  )

  LogDidMount(info) {
    console.log("LLOG DID MOUNT")
  }

  CreateLogHtml(entry) {
      let component = this.parent.cfr.resolveComponentFactory(LogComponent);
      let x = this.parent.entry.createComponent(component);
      x.instance.Entry = entry;
  }

  ShowLogHtml() {

  }

  EventDidMount(info) {
    let props = info.event.extendedProps;
    if (props.type == 'time-log') {
      let el = info.el;
      this.EventContent(info.event, info.el);
    }
    if (props.type != 'milestone')
      this.parent.EventDidMount(info);
  }

  EventContent(event, element: HTMLElement) {
    let t = event.extendedProps.type;
    if (t == 'allocation')
      return event.title;

    else {
      let id = event.id;
      let resolver =this.parent.cfr.resolveComponentFactory(LogComponent);
      let x = this.parent.entry.createComponent(resolver);
      x.instance.Entry = event as CalendarLog;
      let child = element.childNodes.item(2);
      let first = element.children.item(0).firstChild.replaceWith('');
      child.replaceWith(x.instance.element.nativeElement as HTMLElement);
    }
  }

  Events$ = combineLatest([this.parent.Allocations$, this.Logs$, this.parent.Me$]).pipe(
    tap(([allocations, logs, me]) => {
      this.parent.entry.clear();
      let counter = 0;
      _.forEach(allocations, (i:CalendarItem) => {
        i.extendedProps.tooltipId = counter;
        this.parent.CreateTooltip(i.extendedProps, i.extendedProps.tooltipId)
        counter += 1;
      })

      _.forEach(logs, (i:CalendarLog) => {
        i.extendedProps.tooltipId = counter;
        this.parent.CreateTooltip(i.extendedProps.allocation, i.extendedProps.tooltipId)
        //this.CreateLogHtml(i);
        counter += 1;
      })
    }),
    map(([allocations, logs]) => allocations.concat(logs)),
  )


  WeekListOptions$ = this.Events$.pipe(
    map((events) =>
    ({
      plugins: [listPlugin],
      events: events,
      initialView: 'listWeek',
      eventDidMount: (r) => this.EventDidMount(r),
    })
    ),
  )

  DayListOptions$ = this.WeekListOptions$.pipe(
    map(options => {
        options.initialView = 'listDay';
        return options;
    })
  )

  @Input() set ViewMode(s: string) {
    this._ViewMode.next(s);
  }

  ngOnInit(): void {
  }

}
