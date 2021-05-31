import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentFactoryResolver, ElementRef, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, from, fromEvent, merge, Observable, of, timer } from 'rxjs';
import { catchError, delay, distinctUntilChanged, filter, flatMap, map, mergeMap, mergeMapTo, shareReplay, switchMap, take, tap, timestamp } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { ScheduledItem } from 'src/app/models/Monday';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from 'underscore';

import listPlugin from '@fullcalendar/list';

import { ActionGroup, ActionOutletFactory } from '@ng-action-outlet/core';
import { TaskTooltipComponent } from './../tooltips/task/task.component';

import tippy from "tippy.js";
import { Board, BoardItem, Workspace } from 'src/app/models/BoardItem';
import { ProjectService } from 'src/app/services/project.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { LogHoursDlgComponent } from '../dialog/log-hours-dlg/log-hours-dlg.component';
import { CalendarItem, CalendarMilestone, SubItemProperties } from 'src/app/models/Calendar';
import { TimeEntry } from 'src/app/models/TimeLog';
import { ViewTaskDlgComponent } from '../dialog/view-task-dlg/view-task-dlg.component';
import { EventListComponent } from './event-list/event-list.component';
import { CalendarEventComponent } from '../tooltips/calendar-event/calendar-event.component';
import { CalendarMilestoneComponent } from '../tooltips/calendar-milestone/calendar-milestone.component';
import { FirebaseService } from 'src/app/services/firebase.service';

const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline',
  'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  contextMenuTop;
  contextMenuLeft;
  @ViewChild(MatMenu, { static: false }) contextMenu: MatMenu;
  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;
  @ViewChild(LogHoursDlgComponent) LogHoursDlg: LogHoursDlgComponent;
  @ViewChild(ViewTaskDlgComponent) ViewTaskDlg: ViewTaskDlgComponent;
  EventListComponent: EventListComponent;

  @ViewChild('tooltipCreator', { read: ViewContainerRef, static: false }) entry: ViewContainerRef;
  @ViewChildren(TaskTooltipComponent) Tooltips: QueryList<TaskTooltipComponent>;


  private internalRouteParams = new BehaviorSubject<any>(null);
  private errorMessage = new BehaviorSubject<string>(null);

  InternalRouteParams$ = this.internalRouteParams.asObservable().pipe(shareReplay(1));

  showHoursDlg: boolean = false;
  TabOptions = ['Schedule', 'Review', 'Assist', 'Feedback', 'Chart']

  private tab = new BehaviorSubject<string>('Schedule')
  Tab$ = this.tab.asObservable().pipe(shareReplay(1));

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

  refreshItems = new BehaviorSubject<boolean>(null);
  RefreshItems$ = this.refreshItems.asObservable();

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

  onHoursDlg() {
    this.LastEvent$.subscribe((last: ScheduledItem) => {
      this.Me$.pipe(take(1)).subscribe((user) => {;
        this.LogHoursDlg.OpenDialog(last, this.LastDate, user && user.id ? user : null);
      })
    })
  }

  constructor(

    public cfr: ComponentFactoryResolver,
    private actionOutlet: ActionOutletFactory,
    private navigation: NavigationService,
    public monday: MondayService,
    public projectService: ProjectService,
    private firebase: FirebaseService,
    private UserService: UserService,
  ) {

  }

  SetTab(t) {
    this.Tab$.pipe(take(1)).subscribe(tab => {
      if (t && t != tab) {
        this.navigation.Relocate('/Home', { tab: t })
        this.tab.next(t);
      }
    })

  }
  
  Me$ = this.UserService.MondayUser$;

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
        map((users: string[]) => ['All Users'].concat(users)),
        map((users: string[]) => users.forEach(u => menu.createButton().setTitle(u)
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
        map((projects: any[]) => ['All Projects'].concat(projects)),
        map((projects: any[]) => projects.forEach(p =>
          menu.createButton().setTitle(p)
            .fire$.subscribe(a => this.selectedProject.next(p))))
      )
    }),
    map(() => this.ViewProjectMenu),
    shareReplay(1)
  )

  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));
  Boards$ = this.projectService.Boards$;
  User$ = this.UserService.User$;

  Groups$ = this.Boards$.pipe(
    map(boards => _.filter(boards, b => 
      b.workspace &&
      b.name.indexOf('Subitems') < 0
      && b.name[0] != '_')),
    switchMap(boards => {
      let result: Observable<any>[] = [];
      boards.forEach(b => {
        b.groups.forEach(g => result.push(this.projectService.GetGroupItem$(b.id, g.id)))
      });
      return combineLatest(result);
    }),
  );

  Items$ = this.Groups$.pipe(
    map(groups => _.filter(groups)),
    map(groups => _.map(groups, g => g.items)),
    map(items => _.flatten(items)),
    map(items => _.filter(items, i => i.board && i.board.workspace && i.group)),
    map((items: any[]) => _.map(items, i => new ScheduledItem(i))),
    shareReplay(1)
  )

  MyItems$ = combineLatest([this.Me$, this.Items$]).pipe(
    map(([me, items]) => {
      let name = me.name;
      if (me.teams.indexOf('Managers') > -1)
        return items;

      let filtered = _.filter(items, (i:ScheduledItem) =>
        (i.artist && i.artist.length > 0) || (i.director && i.director.length > 0) || i.is_milestone()
      );

      filtered = _.filter(filtered, i =>
        i.is_milestone() ||
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
          filtered = _.filter(filtered, (i:ScheduledItem) => {
            if (i.is_milestone())
              return true;

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
      switchMap(items => this.SubItems$.pipe(
        map(subitems => {
          _.forEach(items, (i) => {
            let ids = _.map(i.subitem_ids, (s) => s.toString());
            if (ids.length < 1)
              return;

            i.subitems = _.filter(subitems, sub => ids.indexOf(sub.id.toString()) > -1);
          });

          return items;
        })
      )),
      distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
      shareReplay(1),
    )

  MyTimelineItems$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.timeline)),
    shareReplay(1)
  )

  MyProjects$ = this.MyItems$.pipe(
    map(items => _.map(items, i => i.workspace.name)),
    map(workspaces => _.uniq(workspaces)),
    distinctUntilChanged((a, b) => a == b),
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
    switchMap((ids: string[]) => this.monday.SubItems$(ids)),
    shareReplay(1)
  )

  RequiresReview$ = this.MyFilteredItems$.pipe(
    map(items => _.filter(items, i => i.status && i.status.text && i.status.text.indexOf('Internal Review') > -1)),
    shareReplay(2),
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


  CreateTooltip(i, index) {
    let component = this.cfr.resolveComponentFactory(TaskTooltipComponent);
    let x = this.entry.createComponent(component);
    x.instance.tooltipId = index;
    x.instance.Item = i;
  }

  findElement(id) {
    return document.getElementById(id);
  }

  onShowTooltip(r) {
    let id = r.reference.getAttribute('data-id');
    r.setContent(this.findElement(id).innerHTML);
  }

  AllocatedContent(event, element: Element) {
    if (event.extendedProps.type == 'milestone') {
      let resolver = this.cfr.resolveComponentFactory(CalendarMilestoneComponent);
      let x = this.entry.createComponent(resolver);
      x.instance.Item = event as CalendarMilestone;      
      let child = element.childNodes.item(0);
      child.replaceWith(x.instance.element.nativeElement as HTMLElement);
      return;
    }

    let resolver = this.cfr.resolveComponentFactory(CalendarEventComponent);
      let x = this.entry.createComponent(resolver);
      x.instance.Item = event as CalendarItem;      
      let child = element.childNodes.item(0);
      child.replaceWith(x.instance.element.nativeElement as HTMLElement);
      //this.AllocationComponents.push(x.instance);
  }

  OnHourLogUpdated(update: {id: string, entries: TimeEntry[]}) {
    this.EventListComponent.UpdateAllocation(update);
  }

  CreateTippy(info) {
    let props = info.event.extendedProps;
    info.el.setAttribute('data-id', props.tooltipId);
    let t = tippy(info.el, {
      content: "",
      placement: 'top',
      allowHTML: true,
      interactive: true,
      onShow: (r) => this.onShowTooltip(r)
    });
  }


  LastDate: moment.Moment;

  Allocations$ = this.MyTimelineItems$.pipe(
    map(items => _.filter(items, i => !i.is_milestone())),
    map(items => _.map(items, i => new CalendarItem(i))),
    switchMap(allocations => {

      let ids = _.map(allocations, (a: CalendarItem) => a.id.toString());
      ids = ids.concat(
        _.flatten(
          _.map(allocations, a => a.extendedProps.subitems.length > 0 ?
            _.map(a.extendedProps.subitems, s => s.id.toString()) : [])
        )
      )
      return this.monday.TimeTracking$(ids).pipe(
        map((logs: TimeEntry[]) => {
          _.forEach(allocations, (item: CalendarItem) => {
            if (item.extendedProps.subitems.length < 1)
              return;

            let subitem_ids = _.map(item.extendedProps.subitems,
              (i: SubItemProperties) => i.id.toString());

            item.extendedProps.logs =
              _.filter(logs, (l: TimeEntry) => l.item == item.id.toString() ||
                subitem_ids.indexOf(l.item) > -1)
          });

          return allocations;
        })
      )
    })
  )

  Milestones$ = this.MyTimelineItems$.pipe(
    map(items => _.filter(items, i => i.is_milestone())),
    map(items => _.map(items, i => new CalendarMilestone(i))),
    map(items => _.uniq(items, (i:CalendarMilestone) => i.start + i.title)),
    shareReplay(1)
  )

  last;
  LastEvent$ = this.MyItems$.pipe(
    map(items => {
      let id = this.last.extendedProps.type == 'time-log' ?
        this.last.extendedProps.allocation.id.toString() : this.last.id.toString();
      return _.find(items, i => i.id.toString() == id)
    }),
    take(1)
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

  ViewModeChange(v) {
    this.ViewMode$.pipe(take(1)).subscribe(current => {
      if (current != v && v) {
        this.viewMode.next(v);
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
  
  initialized = false;
  ngAfterViewInit() {
  }

  
  BoardItemUpdates$ = combineLatest([this.MyFilteredItems$, this.firebase.BoardItemUpdates$]).pipe(
    map(([items, update]) => {
      if (!this.initialized)
      return EMPTY;

      let ids = _.map(items, i => i.id.toString());
      let updated_id = update.item_id;

      let updated = ids.indexOf(updated_id) > -1;
      console.log("THIS WAS UPDATED !");

      return updated ? update : EMPTY;
    })
  )

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
      this.BoardItemUpdates$.subscribe((update) => {
        if (update)
          this.refreshItems.next(true);
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

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

