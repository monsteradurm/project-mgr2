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
import { AllocationComponent } from '../../tooltips/allocation/allocation.component';
import { ArtistComponent } from '../../tooltips/artist/artist.component';

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
    if (props.type != 'milestone') {
      let el = info.el;
      this.EventContent(info.event, info.el);
      this.parent.EventDidMount(info);
    }
  }

  findDateElement(el: Element) : Element{
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
      element.children.item(0).firstChild.replaceWith(x.instance.element.nativeElement as HTMLElement);
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
