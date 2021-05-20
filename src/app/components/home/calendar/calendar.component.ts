import { Component, ComponentFactoryResolver, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ScheduledItem } from 'src/app/models/Monday';
import { HomeComponent } from '../home.component';
import { Calendar, compareByFieldSpec } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import tippy from "tippy.js";
import * as moment from 'moment';
import * as _ from 'underscore';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { of } from 'rxjs';
import { LogHoursDlgComponent } from '../../dialog/log-hours-dlg/log-hours-dlg.component';
import { TaskTooltipComponent } from '../../tooltips/task/task.component';
import { CalendarItem } from 'src/app/models/Calendar';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  constructor(private parent: HomeComponent) {
    const name = Calendar.name;
  }

  Fetching: boolean = false;
  Options:any;
  subscriptions = [];
  primaryColor = this.parent.primaryColor;
  ngOnInit(): void {
    this.subscriptions.push(
      this.Options$.subscribe((options) => { this.Options = options })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  EventDidMount(info) {
    this.parent.AllocatedContent(info.event, info.el);
    let t = this.parent.CreateTippy(info);
    info.el.addEventListener('contextmenu', (evt) => {

      let els = document.elementsFromPoint(evt.x, evt.y);
      let el: Element = _.find(els, (e: Element) => e.classList.contains('fc-daygrid-day'));

      if (el) {
        this.parent.LastDate = moment(el.getAttribute('data-date'), 'YYYY-MM-DD');
      }

      this.parent.contextMenuLeft = evt.x;
      this.parent.contextMenuTop = evt.y;
      this.parent.last = info.event;
      this.parent.contextMenuTrigger.openMenu();
      evt.preventDefault();
    })
    return t;
  }

  addEventListeners(collection: HTMLCollection) {
    for (let d = 0; d < collection.length; d++) {
      let day = collection.item(d);
      let date = day.getAttribute('data-date');
      if (date)
        day.addEventListener('mouseover', (evt: MouseEvent) => {
          let el = document.elementFromPoint(evt.x, evt.y);

          if (!el.classList.contains('fc-daygrid-day'))
            return;

          this.parent.LastDate = moment(date, 'YYYY-MM-DD');
        })
    }
  }

  Options$ =
    of(null).pipe(
      tap(t => this.Fetching = true),
      switchMap(() =>
        this.parent.Allocations$.pipe(
          tap((items: any) => {
            this.parent.entry.clear();
            let counter = 0;
            _.forEach(items, (i: CalendarItem) => {
              i.extendedProps.tooltipId = counter;
              this.parent.CreateTooltip(i.extendedProps, i.extendedProps.tooltipId)
              counter += 1;
            })
          }),
          map((allocations: ScheduledItem[]) => ({
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            events: allocations,
            eventDidMount: (r) => this.EventDidMount(r),
            //eventContent: (r) => this.parent.AllocatedContent(r),
          })
          ),
          //tap(t => this.addEventListeners(document.getElementsByClassName('fc-daygrid-day')))
        )
      ),
      shareReplay(1),
      tap(t => this.Fetching = false)
    )




}
