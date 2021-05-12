import { Component, ComponentFactoryResolver, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ScheduledItem } from 'src/app/models/Monday';
import { HomeComponent } from '../home.component';
import { Calendar, compareByFieldSpec } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { map, switchMap, take, tap } from 'rxjs/operators';
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
export class CalendarComponent implements OnInit {
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  constructor(private parent: HomeComponent) { 
    const name = Calendar.name;
  }

  ngOnInit(): void {

  }

  Options$ = this.parent.Allocations$.pipe(
    tap((items: any) => {
      this.parent.entry.clear();
      let counter = 0;
      _.forEach(items, (i:CalendarItem) => {
        i.extendedProps.tooltipId = counter;
        this.parent.CreateTooltip(i.extendedProps, i.extendedProps.tooltipId)
        counter += 1;
      })
    }),
    map((allocations: ScheduledItem[]) => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: allocations,
      eventDidMount: (r) => this.parent.EventDidMount(r),
      eventContent: (r) => this.parent.AllocatedContent(r)
    })
    ),
  )

  


}
