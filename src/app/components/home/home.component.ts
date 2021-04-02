import { Component, ComponentFactoryResolver, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { ScheduledItem } from 'src/app/models/Monday';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from 'underscore';

import { Calendar, compareByFieldSpec } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import { ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TaskTooltipComponent } from './../tooltips/task/task.component';

import tippy from "tippy.js";

const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline', 
          'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('tooltipCreator', { read: ViewContainerRef }) entry: ViewContainerRef;
  @ViewChildren(TaskTooltipComponent) Tooltips: QueryList<TaskTooltipComponent>;

  TabOptions = ['Calendar', 'List', 'Kanban', 'Chart']
  
  private tab = new BehaviorSubject<string>('Calendar')
  Tab$ = this.tab.asObservable().pipe(shareReplay(1));

  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  listPlugin=[listPlugin]
  startDate = new BehaviorSubject<moment.Moment>(moment().startOf('week'));
  StartDate$ = this.startDate.asObservable().pipe(shareReplay(1));

  endDate = new BehaviorSubject<moment.Moment>(moment().endOf('week'));
  EndDate$ = this.endDate.asObservable().pipe(shareReplay(1));

  Dates$ = combineLatest([this.StartDate$, this.EndDate$]).pipe(
    map(([start, end]) => {
      let result = [];
      let day = moment(start);
      while (day <= end) {
        result.push(day.format('YYYY-MM-DD'));
        day = day.clone().add(1, 'd');
      }
      return result;
    })).pipe(shareReplay(1));


  constructor(
    private actionOutlet: ActionOutletFactory,
    private navigation: NavigationService,
    private cfr: ComponentFactoryResolver,
    private monday: MondayService,
    private UserService : UserService,
    ) { 
      const name = Calendar.name; 
    }
    
  SetTab(t) {
    this.Tab$.pipe(take(1)).subscribe(tab => {
      if (t && t != tab)
        this.tab.next(t);
    })
    
  }
  Me$ = combineLatest([this.UserService.User$, this.monday.MondayUsers$]).pipe(
    map(([me, users]) => _.find(users, u => u.email == me.mail)),
    shareReplay(1)
  )

  ViewModeOptions = {
    'Day' :'dayGrid',
    'Week': 'dayGridWeek',
    'Month': 'dayGridMonth'
  }

  private viewMode = new BehaviorSubject<string>('Month');
  ViewMode$ = this.viewMode.asObservable().pipe(shareReplay(1));
  private ViewModeMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('event');
  private MonthBtn = this.ViewModeMenu.createButton().setTitle('Month');
  private WeekBtn = this.ViewModeMenu.createButton().setTitle('Week');
  private DayBtn = this.ViewModeMenu.createButton().setTitle('Day');

  private viewModeMenu = new BehaviorSubject<ActionGroup>(this.ViewModeMenu);

  ViewModeMenu$ = this.ViewMode$.pipe(
    map(viewMode => {
      this.ViewModeMenu.setTitle(viewMode);
      return this.ViewModeMenu;
    })
  ).pipe(shareReplay(1))

  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));
  Boards$ = this.monday.Boards$;

  Allocations$ = combineLatest([this.Boards$, this.Columns$]).pipe(
    switchMap(([boards, c_ids]) => {
      let b_ids = _.map(boards, b => b.id);
      return this.monday.ColumnValuesFromBoards$(b_ids, c_ids);
    }),
    map((items:any[]) => _.map(items, i => new ScheduledItem(i))),
    map((items:any[]) => _.filter(items, i => i.timeline && i.artist && i.artist.length > 0)),
    tap((items:any) => {
      this.entry.clear();
      _.forEach(items, i => this.CreateToolTipComponent(i))
    }),
    map((items:ScheduledItem[]) =>{
      let result = [];
      let counter = 0;
      _.forEach(items, i=> {
          result.push( {
            extendedProps: { index: counter },
            id: i.id,
            title: i.itemcode && i.itemcode.text ? i.itemcode.text + ', ' + i.name : i.name
            + ' (' +this.GetStatusText(i) + ')', 
            start: i.timeline.value.from,
            end: i.timeline.value.to,
            backgroundColor: this.GetStatusColor(i)
          } );
          counter += 1;
      })
      return result;
    }),
    shareReplay(1)
  )

  CreateToolTipComponent(i) {
    let component = this.cfr.resolveComponentFactory(TaskTooltipComponent);
    //component.inputs.
    //this.entry.clear(); 
    let x = this.entry.createComponent(component);
    x.instance.Item = i;
    return `<div class="tooltip">HERE</div>`
  }
  
  GetStatusText(i) {
    if (i.status && i.status.text)
      return i.status.text;
    return 'Not Started';
  }

  GetStatusColor(i) {
    if (i.status && i.status.additional_info)
      return i.status.additional_info.color;
    return '#000'
  }
  
  ListOptions$ = this.Allocations$.pipe(
    map(allocations => 
    ({
      plugins: [listPlugin],
      events: allocations,
      initialView: 'listWeek'
    })
    )
  )

  Options$ = combineLatest([this.ViewMode$, this.Allocations$]).pipe(
    map(([viewMode, allocations]) => ({
      plugins:  [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: this.ViewModeOptions[viewMode],
      events: allocations,
      viewDidMount: (view) => {
        console.log(view)
      },
      eventDidMount: (info) => {
        info.el.setAttribute('data-id', info.event.id);
        let t = tippy(info.el, {
            content: "",
            allowHTML: true,
            onShow(r) { 
              let id = r.reference.getAttribute('data-id');
              r.setContent(document.getElementById(id).innerHTML)
            }
          });
          return t;
        }
      })
    ),
  )

  ViewModeChange(v) {
    this.ViewMode$.pipe(take(1)).subscribe(current => {
      if (current != v && v) {
        this.viewMode.next(v);
        let calendarApi = this.calendarComponent.getApi();
        calendarApi.changeView(this.ViewModeOptions[v]);
      }
    });
  }
  primaryColor:string;
  subscriptions = [];

  onEventClick(ev) {
    console.log("EVENT", ev);
  }

  onMouseOver(ev) {
    console.log(ev);
  }

  ngOnInit(): void {
    
    this.subscriptions.push(
      this.navigation.PrimaryColor$.subscribe(c => this.primaryColor = c)
    )

    this.subscriptions.push(
      this.MonthBtn.fire$.subscribe(a => this.ViewModeChange('Month'))
    )

    this.subscriptions.push(
      this.WeekBtn.fire$.subscribe(a => this.ViewModeChange('Week'))
    )

    this.subscriptions.push(
      this.DayBtn.fire$.subscribe(a => this.ViewModeChange('Day'))
    )
  }
}