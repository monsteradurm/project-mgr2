import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, timer } from 'rxjs';
import { catchError, delay, distinctUntilChanged, filter, map, shareReplay, switchMap, take, tap, timestamp } from 'rxjs/operators';
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
import { Board, BoardItem, Workspace } from 'src/app/models/BoardItem';
import { SocketService } from 'src/app/services/socket.service';
import { ProjectService } from 'src/app/services/project.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { LogHoursDlgComponent } from '../dialog/log-hours-dlg/log-hours-dlg.component';

const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline',
  'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('month', { static: false }) calendarComponent: FullCalendarComponent;
  @ViewChild('list', { static: false }) listComponent: FullCalendarComponent;
  @ViewChild('tooltipCreator', { read: ViewContainerRef }) entry: ViewContainerRef;
  @ViewChild(LogHoursDlgComponent) LogHoursDlg: LogHoursDlgComponent;
  @ViewChildren(TaskTooltipComponent) Tooltips: QueryList<TaskTooltipComponent>;
  contextMenuTop;
  contextMenuLeft;
  @ViewChild(MatMenu, { static: false }) contextMenu: MatMenu;
  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;

  private internalRouteParams = new BehaviorSubject<any>(null);
  private errorMessage = new BehaviorSubject<string>(null);

  InternalRouteParams$ = this.internalRouteParams.asObservable().pipe(shareReplay(1));

  showHoursDlg: boolean = false;
  TabOptions = ['Schedule', 'Review', 'Assist', 'Feedback', 'Chart']

  private tab = new BehaviorSubject<string>('Schedule')
  Tab$ = this.tab.asObservable().pipe(shareReplay(1));

  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]; // important!
  listPlugin = [listPlugin]
  startDate = new BehaviorSubject<moment.Moment>(moment().startOf('week'));
  StartDate$ = this.startDate.asObservable().pipe(shareReplay(1));

  endDate = new BehaviorSubject<moment.Moment>(moment().endOf('week'));
  EndDate$ = this.endDate.asObservable().pipe(shareReplay(1));

  selectedUser = new BehaviorSubject<string>('All Users');
  SelectedUser$ = this.selectedUser.asObservable().pipe(shareReplay(1));

  selectedProject = new BehaviorSubject<string>('All Projects');
  SelectedProject$ = this.selectedProject.asObservable().pipe(shareReplay(1));

  selectedBoard = new BehaviorSubject<string>('All Boards');
  SelectedBoard$ = this.selectedBoard.asObservable().pipe(shareReplay(1));

  selectedGroup = new BehaviorSubject<string>('All Groups');
  SelectedGroup$ = this.selectedGroup.asObservable().pipe(shareReplay(1));

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

  NavigationParameters$ = combineLatest([
    this.navigation.NavigationParameters$.pipe(timestamp()),
    this.InternalRouteParams$.pipe(timestamp())]).pipe(
      map(
        ([nav, internal]) => {
          if (internal.value == null || nav.timestamp > internal.timestamp) {
            return nav.value;
          }
          return internal.value
        }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    )

  constructor(
    private actionOutlet: ActionOutletFactory,
    private navigation: NavigationService,
    private cfr: ComponentFactoryResolver,
    public monday: MondayService,
    public projectService: ProjectService,
    private socket: SocketService,
    private UserService: UserService,
  ) {
    const name = Calendar.name;
  }

  onHoursDlg() {
    this.LastEvent$.subscribe((last) => {
      this.Me$.pipe(take(1)).subscribe((user) => {
        this.LogHoursDlg.OpenDialog(last, user && user.id ? user : null);
      })
    })
  }



  SetTab(t) {
    this.Tab$.pipe(take(1)).subscribe(tab => {
      if (t && t != tab) {
        this.navigation.Relocate('/Home', { tab: t })
        this.tab.next(t);
      }
    })

  }
  Me$ = combineLatest([this.UserService.User$, this.monday.MondayUsers$]).pipe(
    map(([me, users]) => me && users ? _.find(users, u => u.email == me.mail) : null),
    shareReplay(1)
  )

  ViewModeOptions = {
    'Day': 'dayList',
    'Week': 'weekList',
    'Month': 'dayGridMonth'
  }

  private viewMode = new BehaviorSubject<string>('Month');
  ViewMode$ = this.viewMode.asObservable().pipe(shareReplay(1));

  private ViewModeMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('event');
  private ViewProjectMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('view_list');
  private ViewUserMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('person');
  private ViewBoardMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('dashboard');
  private ViewGroupMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('group_work');
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

  ViewUserMenu$ = this.SelectedUser$.pipe(
    switchMap(selected => {
      let menu = this.ViewUserMenu;
      menu.setTitle(selected);
      menu.removeChildren();
      return this.MyUsers$.pipe(
        map(users => ['All Users'].concat(users)),
        map(users => users.forEach(u => menu.createButton().setTitle(u)
          .fire$.subscribe(a => this.selectedUser.next(u))
        ))
      )
    }),
    map(users => this.ViewUserMenu),
    shareReplay(1)
  )


  ViewProjectMenu$ = this.SelectedProject$.pipe(
    switchMap(selected => {
      let menu = this.ViewProjectMenu;
      menu.setTitle(selected);
      menu.removeChildren();
      return this.MyProjects$.pipe(
        map(projects => ['All Projects'].concat(projects)),
        map(projects => projects.forEach(p =>
          menu.createButton().setTitle(p)
            .fire$.subscribe(a => this.selectedProject.next(p))))
      )
    }),
    map(() => this.ViewProjectMenu),
    shareReplay(1)
  )

  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));
  Boards$ = this.monday.Boards$.pipe(shareReplay(1));

  User$ = this.UserService.User$;
  Items$ = combineLatest([this.Boards$, this.Columns$, this.User$]).pipe(
    switchMap(([boards, c_ids]) => {
      let b_ids = _.map(boards, b => b.id);
      return this.monday.ColumnValuesFromBoards$(b_ids, c_ids);
    }),
    map(items => _.filter(items, i =>
      i.board.name.indexOf('Subitems') < 0
      && i.name[0] != '_'
      && i.board.name[0] != '_')
    ),
    map((items: any[]) => _.map(items, i => new ScheduledItem(i))),
    shareReplay(1)
  )

  MyItems$ = combineLatest([this.Me$, this.Items$]).pipe(
    map(([me, items]) => {
      let name = me.name;
      if (me.teams.indexOf('Managers') > -1)
        return items;

      let filtered = _.filter(items, i =>
        (i.artist && i.artist.length > 0) || (i.director && i.director.length > 0)
      );

      filtered = _.filter(filtered, i =>
        _.find(i.artist, a => a.text.indexOf(name) > -1) ||
        _.find(i.director, d => d.text.indexOf(name) > -1)
      )
      return filtered;
    }),
    shareReplay(1)
  )


  MyFilteredItems$ = combineLatest([this.MyItems$,
  this.SelectedUser$, this.SelectedProject$, this.SelectedBoard$, this.SelectedGroup$])
    .pipe(
      map(([items, user, project, board, group]) => {
        if (user == 'All Users' && project == 'All Projects')
          return items;

        let filtered = items;
        if (user != 'All Users') {
          filtered = _.filter(filtered, i => {
            let artists = _.pluck(i.artist, 'text').join(', ');
            let directors = _.pluck(i.director, 'text').join(', ');
            return artists.indexOf(user) > -1 || directors.indexOf(user) > -1
          });
        }

        if (project != 'All Projects') {
          filtered = _.filter(filtered, i => i.workspace.name.indexOf(project) > -1);
        }

        if (board != 'All Boards') {
          filtered = _.filter(filtered, i => i.board.name.indexOf(board) > -1)
        }

        if (group != 'All Groups') {
          filtered = _.filter(filtered, i => i.group.title.indexOf(group) > -1)
        }
        return filtered;
      }),
      shareReplay(1)
    )

  MyTimelineItems$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.timeline)),
    shareReplay(1)
  )

  MyProjects$ = this.MyItems$.pipe(
    map(items => _.map(items, i => i.workspace.name)),
    map(workspaces => _.uniq(workspaces)),
    shareReplay(1)
  )

  MyBoards$ = combineLatest([this.MyItems$, this.SelectedProject$]).pipe(
    map(([items, project]) => {
      if (project == 'All Projects') return [];

      let filtered = _.filter(items, i => i.workspace.name.indexOf(project) > -1);
      return _.uniq(_.map(filtered, i => i.board.name));
    })
  )

  MyGroups$ = combineLatest([this.MyItems$, this.SelectedProject$, this.SelectedBoard$]).pipe(
    map(([items, project, board]) => {
      if (project == 'All Projects' || board == 'All Boards') return [];

      let filtered = _.filter(items, i => i.workspace.name.indexOf(project) > -1);
      filtered = _.filter(filtered, i => i.board.name.indexOf(board) > -1);

      return _.uniq(_.map(filtered, i => i.group.title));
    })
  )

  ViewGroupMenu$ = combineLatest([this.SelectedGroup$, this.MyGroups$]).pipe(
    map(([selected, groups]) => {
      let menu = this.ViewGroupMenu;
      let options = ['All Groups'].concat(groups);
      let valid = options.indexOf(selected) > -1;

      menu.setTitle(valid ? selected : options[0]);
      menu.removeChildren();
      options.forEach(o => menu.createButton().setTitle(o).fire$.subscribe(
        a => this.selectedGroup.next(o)
      ))
      return menu;
    })
  )

  ViewBoardMenu$ = combineLatest([this.SelectedBoard$, this.MyBoards$]).pipe(
    map(([selected, boards]) => {
      let menu = this.ViewBoardMenu;
      let options = ['All Boards'].concat(boards);
      let valid = options.indexOf(selected) > -1;

      menu.setTitle(valid ? selected : options[0]);
      menu.removeChildren();
      options.forEach(o => menu.createButton().setTitle(o).fire$.subscribe(
        a => this.selectedBoard.next(o)
      ))
      return menu;
    })
  )

  MyUsers$ = this.MyItems$.pipe(
    map(items => {
      let artists =
        _.map(
          _.filter(items, i => i.artist && i.artist.length > 0),
          a => a.artist);

      let directors =
        _.map(
          _.filter(items, i => i.director && i.director.length > 0),
          d => d.director);

      artists = _.map(artists, cols => _.map(cols, a =>
        a.text.split(', ')));
      directors = _.map(directors, cols => _.map(cols, a => a.text.split(', ')));

      return _.filter(
        _.uniq(_.flatten(artists.concat(directors))), u => u.length > 0)
    }),
    shareReplay(1)
  )

  SubItems$ = this.MyItems$.pipe(
    map(items => _.map(items, i => i.subitem_ids)),
    map(nestedIds => _.map(nestedIds, ids => ids && ids.length > 0 ?
      ids[ids.length - 1] : [])),
    map(nested => _.flatten(nested)),
    switchMap(ids => this.monday.SubItems$(ids)),
    shareReplay(1)
  )

  RequiresReview$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.status && i.status.text && i.status.text.indexOf('Internal Review') > -1)),
    shareReplay(2),
    tap(console.log)
  )

  RequiresAssistance$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.status && i.status.text && i.status.text.indexOf('Requires Assistance') > -1)),
    shareReplay(2)
  )

  ReceivedFeedback$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.status && i.status.text &&
      i.status.text.indexOf('Received') > -1 && i.status.text.indexOf('Feedback') > -1)),
    shareReplay(2)
  )

  LoggedHours$ = this.Items$.pipe(
    map(items => _.filter(items, i => i.timetracking)),
    shareReplay(1)
  )

  LastEvent$ = this.MyItems$.pipe(
    map(items => _.find(items, i => i.id.toString() == this.last.id.toString())),
    switchMap((item: ScheduledItem) => {
      if (!item)
        return of(null);
      else if (!item.subitem_ids || item.subitem_ids.length < 1)
        return of(item);

      let ids = _.map(item.subitem_ids, i => i.toString());
      return this.SubItems$.pipe(
        map(subitems => {
          item.subitems = _.filter(subitems, i => ids.indexOf(i.id.toString()) > -1);
          return item;
        })
      )
    }),
    take(1)
  )

  Events$ = this.MyTimelineItems$.pipe(
    tap((items: any) => {
      this.entry.clear();
      _.forEach(items, i => this.CreateToolTipComponent(i))
    }),
    map((items: ScheduledItem[]) => {
      let result = [];
      let counter = 0;
      _.forEach(items, (i: ScheduledItem) => {
        let color = this.GetStatusColor(i);
        let ismilestone = i.is_milestone();

        if (!ismilestone) {
          result.push({
            extendedProps: { tooltipId: i.id, type: 'allocation' },
            id: i.id,
            title: i.itemcode && i.itemcode.text ? i.itemcode.text + ', ' + i.name : i.name
              + ' (' + this.GetStatusText(i) + ')',
            start: i.timeline.value.from,
            end: i.timeline.value.to,
            backgroundColor: color,
            background: i.is_milestone() ? 'background' : null
          });

          if (i.timetracking) {
            let values = i.timetracking['additional_value'];
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
        }
        else {
          result.push({
            extendedProps: { tooltipId: i.id, type: 'milestone' },
            id: i.id,
            start: i.timeline.value.from,
            end: i.timeline.value.to,
            title: i.name,
            display: 'background',
            classNames: ['milestone-item']
          });
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

  WeekListOptions$ = this.Events$.pipe(
    map(allocations =>
    ({
      plugins: [listPlugin],
      events: allocations,
      initialView: 'listWeek',
      eventDidMount: (r) => this.eventDidMount(r)
    })
    )
  )

  DayListOptions$ = this.Events$.pipe(
    map(allocations =>
    ({
      plugins: [listPlugin],
      events: allocations,
      initialView: 'listDay',
      eventDidMount: (r) => this.eventDidMount(r)
    })
    )
  )

  onShow(r) {
    let id = r.reference.getAttribute('data-id');
    r.setContent(document.getElementById(id).innerHTML);
  }

  last;
  eventDidMount(info) {

    let html = info.el as HTMLElement;
    let props = info.event.extendedProps;
    if (props.type != 'logbtn' && props.type != 'milestone') {
      info.el.setAttribute('data-id', props.tooltipId);
      let t = tippy(info.el, {
        content: "",
        allowHTML: true,
        interactive: true,
        onShow: (r) => this.onShow(r)
      });

      html.addEventListener('contextmenu', (evt) => {
        this.contextMenuLeft = evt.x;
        this.contextMenuTop = evt.y;
        this.last = info.event;
        this.contextMenuTrigger.openMenu();
        evt.preventDefault();
      })

      return t;
    }
  }


  eventContent(r) {
    let t = r.event.extendedProps.type;

    if (t == 'allocation')
      return r.event.title; //{ html: '<i>some html</i>' }
    else if (t == 'milestone') {
      let icon = `<mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" 
        aria-hidden="true" data-mat-icon-type="font" style=" font-size: 22px;
        line-height: 22px;margin-top:3px">priority_high</mat-icon>`
      let html = `${icon} <span style="margin-left: 2px;vertical-align:super;font-weight:bold">${r.event.title}</span>`
      return { html }
    }

    let icon = `<mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" 
        aria-hidden="true" data-mat-icon-type="font" style="    font-size: 18px;
        line-height: 25px;">schedule</mat-icon>`
    let html = `${icon} <span style="margin-left: 5px">${r.event.title}</span>`
    return { html };
  }

  Options$ = combineLatest([this.ViewMode$, this.Events$]).pipe(
    map(([viewMode, allocations]) => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: this.ViewModeOptions[viewMode],
      events: allocations,
      eventDidMount: (r) => this.eventDidMount(r),
      eventContent: (r) => this.eventContent(r)
    })
    ),
  )

  AddTippy(evt, text) {
    //console.log(evt);
  }

  ViewModeChange(v) {
    this.ViewMode$.pipe(take(1)).subscribe(current => {
      if (current != v && v) {
        this.viewMode.next(v);
        /*
        if (v == 'Month') {
          let calendarApi = this.calendarComponent.getApi();
          calendarApi.changeView(this.ViewModeOptions[v]);
        }
         else {
          let listApi = this.listComponent.getApi();
          listApi.changeView(this.ViewModeOptions[v]);
         } */
      }
    });
  }
  primaryColor: string;
  subscriptions = [];

  Workspaces$ = this.MyItems$.pipe(
    map(items => items ? _.map(items, i => i.workspace) : []),
    map(ws => _.uniq(ws, w => w.id)),
  )

  WorkspacesMenu$ = of(null);

  ngAfterViewInit() {
    ;
  }

  OnVisibilityChange(state) {
    //console.log(state);
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

    this.subscriptions.push(
      this.NavigationParameters$.subscribe(params => {
        this.Tab$.pipe(take(1)).subscribe(tab => {
          if (tab != params.tab)
            this.SetTab(params.tab);
        })
      })
    )
    this.subscriptions.push(
      this.Tab$.subscribe(
        (tab) => {
          this.navigation.SetPageTitles([tab]);
        }
      )
    )
  }
}

