import { Component, Input, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { HomeComponent } from '../home.component';
import listPlugin from '@fullcalendar/list';
import { CalendarItem, CalendarLog, CalendarProperties } from 'src/app/models/Calendar';
import * as _ from 'underscore';
import * as moment from 'moment';
import { TimeEntry } from 'src/app/models/TimeLog';
import { Calendar, compareByFieldSpec, Identity } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LogComponent } from '../../tooltips/log/log.component';
import { AllocationComponent } from '../../tooltips/allocation/allocation.component';
import { ArtistComponent } from '../../tooltips/artist/artist.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnDestroy {
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  AllocationComponents = [];
  ArtistComponents = [];
  LogComponents = [];

  listPlugin = [listPlugin]
  constructor(private parent: HomeComponent) { }

  Fetching: boolean = false;
  _ViewMode = new BehaviorSubject<string>(null);
  ViewMode$ = this._ViewMode.asObservable().pipe(shareReplay(1));

  UpdateAllocation(update: { id: string, entries: TimeEntry[] }) {
    if (!update || !update.id)
      return;

    let allocation: AllocationComponent = _.find(this.AllocationComponents, (a: AllocationComponent) => a.Event.id == update.id);

    if (allocation)
      allocation.SetLogs(update.entries);
  }

  CreateLogHtml(entry) {
    let component = this.parent.cfr.resolveComponentFactory(LogComponent);
    let x = this.parent.entry.createComponent(component);
    x.instance.Entry = entry;
  }

  ShowLogHtml() {

  }

  GetDate(x, y) {

    let dates = _.filter(
      _.map([this.AllocationComponents, this.ArtistComponents, this.LogComponents], components => {
        let mouseOver = _.filter(components, c => c.IsMouseOver);
        if (mouseOver.length > 0)
          return mouseOver[0].Date;
      }
      )
    )
    if (dates.length > 0)
      return dates[0];

    return null;
    /*
    for(let d = 0; d < days.length; d++) {

      let day = days.item(d) as HTMLElement;

      let sx = day.clientLeft + 100;
      let ex = sx + day.clientWidth;
      let sy = day.clientTop + 50;
      let ey = sy + day.clientHeight;

      console.log(x, y, sx, sy, ex, ey)
      if ((x >= sx && x <= ex) && (y >= sy && y <= ey)) {
        console.log("HERE", day);
        return day.previousElementSibling.getAttribute('data-date');
      }
    }*/


  }

  EventDidMount(info) {
    let props = info.event.extendedProps;
    if (props.type != 'milestone') {
      let el = info.el;
      this.EventContent(info.event, info.el);

      let t = this.parent.CreateTippy(info);
      info.el.addEventListener('contextmenu', (evt) => {
        let date = this.GetDate(evt.x, evt.y);
        if (date) {
          this.parent.LastDate = date;
          this.parent.contextMenuLeft = evt.x;
          this.parent.contextMenuTop = evt.y;
          this.parent.last = info.event;
          this.parent.contextMenuTrigger.openMenu();
        }

        evt.preventDefault();
      })
    }
  }

  findDateElement(el: Element): Element {
    let sibling = el.previousElementSibling;

    if (sibling.classList.contains('fc-list-day'))
      return sibling;

    return this.findDateElement(sibling);
  }

  EventContent(event, element: Element) {

    let t = event.extendedProps.type;
    let id = event.id;

    let date = this.findDateElement(element).getAttribute('data-date');

    if (t != 'milestone') {
      let resolver = this.parent.cfr.resolveComponentFactory(ArtistComponent);
      let x = this.parent.entry.createComponent(resolver);
      x.instance.Ids = event.extendedProps.users;
      x.instance.Date = moment(date, 'YYYY-MM-DD');
      element.children.item(0).firstChild.replaceWith(x.instance.element.nativeElement as HTMLElement);
      this.ArtistComponents.push(x.instance);
    }

    if (t == 'allocation') {
      let resolver = this.parent.cfr.resolveComponentFactory(AllocationComponent);
      let x = this.parent.entry.createComponent(resolver);
      x.instance.Event = event as CalendarItem;
      x.instance.height = 67 + ((event.extendedProps.users.length - 1) * 49);
      x.instance.primaryColor = event.backgroundColor;
      x.instance.date = moment(date, 'YYYY-MM-DD');
      let child = element.childNodes.item(2).firstChild;
      child.replaceWith(x.instance.element.nativeElement as HTMLElement);
      this.AllocationComponents.push(x.instance);
    }
    else if (t != 'milestone') {
      let resolver = this.parent.cfr.resolveComponentFactory(LogComponent);
      let x = this.parent.entry.createComponent(resolver);
      x.instance.Entry = event as CalendarLog;
      let child = element.childNodes.item(2);
      child.replaceWith(x.instance.element.nativeElement as HTMLElement);
    }
  }

  Events$ = this.parent.Allocations$.pipe(
    map(allocations => {
      this.parent.entry.clear();
      let counter = 0;
      _.forEach(allocations, (i: CalendarItem) => {
        i.extendedProps.tooltipId = counter;
        this.parent.CreateTooltip(i.extendedProps, i.extendedProps.tooltipId)
        counter += 1;
      })
      return allocations;
    }),
  )


  WeekListOptions$ =
    of(null).pipe(
      tap(t => this.Fetching = true),
      switchMap(() => this.Events$.pipe(
        map((events) =>
        ({
          plugins: [listPlugin],
          events: events,
          initialView: 'listWeek',
          weekends: false,
          eventDidMount: (r) => this.EventDidMount(r),
        })
        ),
      )
      ),
      shareReplay(1),
      tap(t => this.Fetching = false)
    )
  _

  DayListOptions$ = this.WeekListOptions$.pipe(
    map(options => {
      options.initialView = 'listDay';
      return options;
    })
  )

  @Input() set ViewMode(s: string) {
    this._ViewMode.next(s);
  }

  WeekOptions;
  subscriptions = [];

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  ngOnInit(): void {
    this.parent.EventListComponent = this;
    this.subscriptions.push(
      this.WeekListOptions$.subscribe(weekOptions => this.WeekOptions = weekOptions)
    )
  }

}
