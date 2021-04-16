import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of } from 'rxjs';
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
import { Board, BoardItem } from 'src/app/models/BoardItem';

const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline', 
          'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('tooltipCreator', { read: ViewContainerRef }) entry: ViewContainerRef;
  @ViewChildren(TaskTooltipComponent) Tooltips: QueryList<TaskTooltipComponent>;

  showHoursDlg: boolean = false;
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
    public monday: MondayService,
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

  ViewModeMenu$ = combineLatest([this.Tab$, this.ViewMode$]).pipe(
    map(([tab, viewMode]) => {
      this.ViewModeMenu.setTitle(viewMode);
      return this.ViewModeMenu;
    })
  )

  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));

  Boards$ = this.monday.Boards$;
  
  Items$ = combineLatest([this.Boards$, this.Columns$]).pipe(
    switchMap(([boards, c_ids]) => {
      let b_ids = _.map(boards, b => b.id);
      return this.monday.ColumnValuesFromBoards$(b_ids, c_ids);
    }),
    map((items:any[]) => _.map(items, i => new ScheduledItem(i))),
    shareReplay(1)
  )

  MyItems$ = combineLatest([this.Me$, this.Items$]).pipe(
    map(([me, items]) => {
      let name = me.name;
      let filtered = _.filter(items, i => i.timeline)
      filtered =  _.filter(filtered, i => 
        (i.artist && i.artist.length > 0) || (i.director && i.director.length > 0)
      );

      filtered = _.filter(filtered, i=>
       _.find(i.artist, a => a.text.indexOf(name) > -1) || 
       _.find(i.director, d => d.text.indexOf(name) > -1)
      )  
    return filtered;
    }),
    shareReplay(1)
  )

  LoggedHours$ = this.Items$.pipe(
    map(items => _.filter(items, i => i.timetracking)),
    shareReplay(1)
  )

  Events$ = this.MyItems$.pipe(
    tap((items:any) => {
      this.entry.clear();
      _.forEach(items, i => this.CreateToolTipComponent(i))
    }),
    map((items:ScheduledItem[]) =>{
      let result = [];
      let counter = 0;
      _.forEach(items, i=> {
          let color = this.GetStatusColor(i);
          result.push( {
            extendedProps: { tooltipId: i.id, type: 'allocation' },
            id: i.id,
            title: i.itemcode && i.itemcode.text ? i.itemcode.text + ', ' + i.name : i.name
            + ' (' + this.GetStatusText(i) + ')', 
            start: i.timeline.value.from,
            end: i.timeline.value.to,
            backgroundColor: color
          } );
          
          if (i.timetracking) {
            let values = i.timetracking.additional_value;
            if (values && values.length > 0) {
              _.forEach(values, t => {
                let started = moment(t.started_at);
                let finished = moment(t.ended_at);
                let time = finished.diff(started, 'minutes');
                let tracked = time + ' minutes';

                if (time >= 60) {
                  time = time / 60;
                  tracked = time + ' hours';
                }

                result.push({
                  extendedProps: { tooltipId: i.id, type: 'timetracking' },
                  id: t.id,
                  backgroundColor: color,
                  start: t.started_at,
                  end: t.ended_at,
                  title: `Logged ${tracked}`,
                  display: 'list-item',
                  classNames: ['log-item']
                });
              })

            }
            
            
          } 
          counter += 1;
      })
      /*
      _.forEach(this.GetLogDateArray(), (d) =>  { 
        result.push({
          extendedProps: { tooltipId: d, type: 'logbtn' },
          start: d,
          end: d,
          classNames: ['log-hours-container']
        })
      })*/
      return result;
    }),
    shareReplay(1)
  )

  GetLogDateArray() {
    var start = moment().startOf('month').subtract(1, 'month');
    var end = moment().endOf('month').add(1, 'month');

    var days = [];
    var day = moment(start);

    while (day <= end) {
        days.push(day.format('YYYY-MM-DD'));
        day = day.clone().add(1, 'd');
    }

    return days;
  }
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
  
  ListOptions$ = this.Events$.pipe(
    map(allocations => 
    ({
      plugins: [listPlugin],
      events: allocations,
      initialView: 'listWeek',
      eventDidMount: (r) => this.eventDidMount(r)
    })
    )
  )

  onShow(r) {
    let id = r.reference.getAttribute('data-id');
    r.setContent(document.getElementById(id).innerHTML);
  }
  eventDidMount(info) {
    let props = info.event.extendedProps;
    if (props.type != 'logbtn') {
      info.el.setAttribute('data-id', props.tooltipId);
      let t = tippy(info.el, {
          content: "",
          allowHTML: true,
          interactive: true,
          onShow: (r) => this.onShow(r)
        });
        return t;
      }
    } 
  
  eventContent(r) {
    let t = r.event.extendedProps.type;

    if (t == 'allocation')
      return r.event.title; //{ html: '<i>some html</i>' }
      let icon = `<mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" 
        aria-hidden="true" data-mat-icon-type="font" style="    font-size: 18px;
        line-height: 25px;">schedule</mat-icon>`
    let html = `${icon} <span style="margin-left: 5px">${r.event.title}</span>`
    return { html };
  }

  Options$ = combineLatest([this.ViewMode$, this.Events$]).pipe(
    map(([viewMode, allocations]) => ({
      plugins:  [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: this.ViewModeOptions[viewMode],
      events: allocations,
      eventDidMount: (r) => this.eventDidMount(r),
      eventContent: (r) => this.eventContent(r)
      })
    ),
  )

  AddTippy(evt, text) {
    console.log(evt);
  }
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

  ngAfterViewInit() {
  }
  
  OnVisibilityChange(state) {
    console.log(state);
    this.showHoursDlg = state;
  }
  onCloseHoursDlg() {
  }

  ngOnInit(): void {
    this.navigation.SetPageTitles([])
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

