import { Component, OnInit, OnDestroy, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, ApplicationRef, ViewChildren, QueryList, HostListener, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectComponent } from '../project/project.component';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, tap, shareReplay, timestamp, take, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';

import * as _ from 'underscore';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { Tag } from 'src/app/models/Columns';
import { BoxService } from 'src/app/services/box.service';
import { OverviewGanttComponent } from './overview-gantt/overview-gantt.component';
import { OverviewSubitemComponent } from './overview-subitem/overview-subitem.component';
import * as moment from 'moment';
import { LogHoursDlgComponent } from '../../dialog/log-hours-dlg/log-hours-dlg.component';
import { ScheduledItem } from 'src/app/models/Monday';
import { ViewTaskDlgComponent } from '../../dialog/view-task-dlg/view-task-dlg.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild(LogHoursDlgComponent) LogHoursDlg: LogHoursDlgComponent;
  @ViewChild(ViewTaskDlgComponent) ViewTaskDlg: ViewTaskDlgComponent;
  @ViewChild('boardsLayout', {static: false, read: ElementRef}) BoardsLayout : ElementRef;

  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    evt.preventDefault();
  }

  ShowHoursLog = false;
  onHoursDlg(item: BoardItem | ScheduledItem) {
    this.parent.userService.MondayUser$.pipe(take(1)).subscribe((user) => {
      this.LogHoursDlg.OpenDialog(item, null, user && user.id ? user: null);
    })

  }

  initializing = true;
  subscriptions = [];
  Fetching = true;
  constructor(public parent: ProjectComponent,
    private changeDetector: ChangeDetectorRef,
    private actionOutlet: ActionOutletFactory) {
  }

  private groupMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('group_work');
  private updatedBoardItems = new BehaviorSubject<BoardItem[]>(null);
  private updatedSubItems = new BehaviorSubject<SubItem[]>(null);

  private ignoredStatus = new BehaviorSubject<string[]>([]);
  IgnoredStatus$ = this.ignoredStatus.asObservable().pipe(shareReplay(1));

  private ignoredArtists = new BehaviorSubject<string[]>([]);
  IgnoredArtists$ = this.ignoredArtists.asObservable().pipe(shareReplay(1));

  private ignoredDirectors = new BehaviorSubject<string[]>([]);
  IgnoredDirectors$ = this.ignoredDirectors.asObservable().pipe(shareReplay(1));

  private nameFilter = new BehaviorSubject<string>('');
  NameFilter$ = this.nameFilter.asObservable().pipe(shareReplay(1));

  private reverseSorting = new BehaviorSubject<boolean>(false);
  ReverseSorting$ = this.reverseSorting.asObservable().pipe(shareReplay(1));

  private sortBy = new BehaviorSubject<string>('Name');
  SortBy$ = this.sortBy.asObservable().pipe(shareReplay(1));

  SortByOptions = ['Name', 'Item Code', 'Status', 'Artist', 'Director', 'Caption', 'Start', 'Finish'];

  statusMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Status').setIcon('library_add_check');
  artistsMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Artists').setIcon('person');
  directorsMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Directors').setIcon('supervisor_account')

  sortByMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Sort By')
    .setIcon('sort_by_alpha');

  UpdatedBoardItems$ = this.updatedBoardItems.asObservable().pipe(shareReplay(1));
  UpdatedSubItems$ = this.updatedSubItems.asObservable().pipe(shareReplay(1));
  SyncBoard$ = this.parent.SyncBoard$;

  private get box() { return this.parent.box; }

  GanttView: OverviewGanttComponent;
  @Output() Expanded: string[] = [];


  SubItems$ : Observable<SubItem[]> =
    of(null).pipe(
      switchMap(t => {
        this.Fetching = true;
        return combineLatest([
          this.parent.SubItems$.pipe(timestamp()),
          this.UpdatedSubItems$.pipe(timestamp())]).pipe(
            map(([parent, updated]) => {
              if (!updated.value)
                return parent.value;

              else if (updated.timestamp > parent.timestamp)
                return updated.value;

              return parent.value;
            })
          )
      }),
      tap(t => this.Fetching = false),
      shareReplay(1)
    );

  onExpand(i) {
    if (this.Expanded.indexOf(i) > -1)
      this.Expanded = _.filter(this.Expanded, e => e != i);
    else
      this.Expanded = [...this.Expanded, i];
  }

  SetGanttView(g) { this.GanttView = g; }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  SetReverseSorting() {
    this.ReverseSorting$.pipe(take(1)).subscribe(state => this.reverseSorting.next(!state));
  }

  onSelectItem(item) {
    this.User$.pipe(take(1)).subscribe((user) => {
      this.ViewTaskDlg.OpenDialog(item, user)
    })
  }

  SetNameFilter(n) {
    if (!n) n = '';
    this.nameFilter.next(n);
  }

  InvertFilteredStatus() {
    combineLatest([this.Status$, this.IgnoredStatus$]).pipe(
      map(([status, ignored]) => _.filter(status, s => ignored.indexOf(s) < 0)),
    ).pipe(take(1)).subscribe(status => this.ignoredStatus.next(status));
  }

  InvertFilteredArtists() {
    combineLatest([this.Artists$, this.IgnoredArtists$]).pipe(
      map(([artists, ignored]) => _.filter(artists, s => ignored.indexOf(s) < 0)),
    ).pipe(take(1)).subscribe(artists => this.ignoredArtists.next(artists));
  }

  InvertFilteredDirectors() {
    combineLatest([this.Directors$, this.IgnoredDirectors$]).pipe(
      map(([directors, ignored]) => _.filter(directors, s => ignored.indexOf(s) < 0)),
    ).pipe(take(1)).subscribe(directors => this.ignoredDirectors.next(directors));
  }

  BoardId$ = this.parent.Board$.pipe(
    map((board: any) => board.id.toString()),
    shareReplay(1)
  )

  BoardItems$ =
    of(null).pipe(
      switchMap(t => {
        this.Fetching = true;
        return combineLatest([
          this.parent.BoardItems$.pipe(timestamp()),
          this.UpdatedBoardItems$.pipe(timestamp())]).pipe(
            map(([parent, updated]) => {
              if (!updated.value)
                return parent.value;

              else if (updated.timestamp > parent.timestamp)
                return updated.value;

              return parent.value;
            })
          )
      }),
      tap(t => this.Fetching = false),

      shareReplay(1)
    )

  ProjectReference$ = this.parent.ProjectReference$;
  Board$ = this.parent.Board$;
  BadgeOptions$ = this.parent.BadgeOptions$;

  Group$ = this.parent.Group$;
  Departments$ = this.parent.Departments$;
  Department$ = this.parent.Department$;
  ErrorMessage$ = this.parent.ErrorMessage$;
  Status$ = this.parent.Status$;
  Artists$ = this.parent.Artists$;
  Directors$ = this.parent.Directors$;

  BoardWidth;
  GanttWidth;
  GanttHeight;
  onBoardsResize(evt, el:HTMLElement) {
    this.BoardWidth = evt.width;
    this.GanttWidth = window.innerWidth - evt.width;
    if (window.innerHeight > el.clientHeight)
      this.GanttHeight = window.innerHeight - 115; 
    else this.GanttHeight = el.clientHeight;
  }

  onItemClicked(item) {
    this.GanttView.ScrollTo(item)
  }

  UpdateBoardItem(item) {
    this.BoardItems$.pipe(take(1)).subscribe(items => {
      let entry = _.findIndex(items, i => i.id == item.id);
      items[entry] = item;
      this.updatedBoardItems.next([...items]);
    })
  }

  UpdateSubItem(item) {
    this.SubItems$.pipe(take(1)).subscribe(items => {
      let entry = _.findIndex(items, i => i.id == item.id);
      items[entry] = item;
      this.updatedSubItems.next([...items]);
    })
  }

  StatusMenu$ = combineLatest([this.Status$, this.IgnoredStatus$]).pipe(
    map(([options, ignored]) => {
      this.initializing = true;
      this.statusMenu.removeChildren();

      options.forEach(o => {
        this.statusMenu.setTitle('Status (' + (options.length - ignored.length) + ' Selected)')
        if (ignored.indexOf(o) == -1)
          this.statusMenu.createToggle().setIcon('add').setTitle(o)
            .fire$.subscribe(a => this.SetStatusFilter(o))
        else
          this.statusMenu.createToggle().setIcon('remove').setTitle(o)
            .fire$.subscribe(a => this.SetStatusFilter(o))
      })

      let bottom = this.statusMenu.createGroup();

      bottom.createButton().setIcon('invert_colors').setTitle('Invert').fire$.subscribe(a => this.InvertFilteredStatus());
      bottom.createButton().setIcon('clear').setTitle('Clear').fire$.subscribe(a => this.ignoredStatus.next([]));

      this.initializing = false;
      return this.statusMenu;
    }),
    shareReplay(1),
  )

  onMouseWheel(evt) {
    evt.preventDefault();
    evt.returnValue = false;
  }

  DirectorsMenu$ = combineLatest([this.Directors$, this.IgnoredDirectors$]).pipe(
    map(([options, ignored]) => {
      this.initializing = true;
      this.directorsMenu.removeChildren();

      options.forEach(o => {
        this.directorsMenu.setTitle('Directors (' + (options.length - ignored.length) + ' Selected)')
        if (ignored.indexOf(o) == -1)
          this.directorsMenu.createToggle().setIcon('add').setTitle(o)
            .fire$.subscribe(a => this.SetDirectorsFilter(o))
        else
          this.directorsMenu.createToggle().setIcon('remove').setTitle(o)
            .fire$.subscribe(a => this.SetDirectorsFilter(o))
      })

      let bottom = this.directorsMenu.createGroup();
      bottom.createButton().setIcon('invert_colors').setTitle('Invert').fire$.subscribe(a => this.InvertFilteredDirectors());
      bottom.createButton().setIcon('clear').setTitle('Clear').fire$.subscribe(a => this.ignoredDirectors.next([]));

      this.initializing = false;
      return this.directorsMenu;
    }),
    shareReplay(1),
  )

  ArtistsMenu$ = combineLatest([this.Artists$, this.IgnoredArtists$]).pipe(
    map(([options, ignored]) => {
      this.initializing = true;
      this.artistsMenu.removeChildren();

      options.forEach(o => {
        this.artistsMenu.setTitle('Artists (' + (options.length - ignored.length) + ' Selected)')
        if (ignored.indexOf(o) == -1)
          this.artistsMenu.createToggle().setIcon('add').setTitle(o)
            .fire$.subscribe(a => this.SetArtistsFilter(o))
        else
          this.artistsMenu.createToggle().setIcon('remove').setTitle(o)
            .fire$.subscribe(a => this.SetArtistsFilter(o))
      })
      let bottom = this.artistsMenu.createGroup()
      bottom.createButton().setIcon('invert_colors').setTitle('Invert').fire$.subscribe(a => this.InvertFilteredArtists());
      bottom.createButton().setIcon('clear').setTitle('Clear').fire$.subscribe(a => this.ignoredArtists.next([]));

      this.initializing = false;
      return this.artistsMenu;
    }),
    shareReplay(1),
  )

  SetSortBy(s) {
    if (this.initializing) return;
    this.SortBy$.pipe(take(1)).subscribe(sortBy => {
      this.sortBy.next(s);
    })
  }

  SetMenuFilter(s,
    Options$: Observable<string[]>,
    Ignored$: Observable<string[]>,
    Ignore: BehaviorSubject<string[]>
  ) {
    if (this.initializing) return;

    combineLatest([Options$, Ignored$]).pipe(take(1)).subscribe(
      ([options, ignored]) => {
        if (ignored.length == 0) {
          Ignore.next(_.filter(options, o => o != s))
          return;
        }

        if (ignored.indexOf(s) < 0)
          ignored.push(s)
        else
          ignored = _.filter(ignored, i => i != s);

        if (ignored.length == options.length)
          ignored = [];

        Ignore.next(ignored);
      });
  }

  SetDirectorsFilter(s) {
    this.SetMenuFilter(s, this.Directors$, this.IgnoredDirectors$, this.ignoredDirectors);
  }

  SetStatusFilter(s) {
    this.SetMenuFilter(s, this.Status$, this.IgnoredStatus$, this.ignoredStatus);
  }

  SetArtistsFilter(s) {
    this.SetMenuFilter(s, this.Artists$, this.IgnoredArtists$, this.ignoredArtists);
  }


  SortByMenu$ = this.SortBy$.pipe(
    map((sortBy) => {
      this.initializing = true;
      this.sortByMenu.removeChildren();
      this.sortByMenu.setTitle('Sort By ' + sortBy)
      this.SortByOptions.forEach(o => {
        this.sortByMenu.createButton().setTitle(o).fire$.subscribe(a => this.SetSortBy(o));
      })

      this.initializing = false;
      return this.sortByMenu;
    })
  )


  GroupsMenu$ = combineLatest([this.Board$, this.Group$]).pipe(
    map(([board, group]) => {
      if (!board || !group || !group.title)
        return null;
      this.groupMenu.setTitle(group.title);
      this.groupMenu.removeChildren();
      board.groups.forEach(g => {
        if (g.title != 'Milestones')
        this.groupMenu.createButton()
        .setTitle(g.title).fire$.subscribe(a => this.SetGroup(g.id))
      });
      return this.groupMenu;
    }),
  )


  SetGroup(g) {
    this.parent.SetGroup(g);
  }

  get primaryColor() { return this.parent.PrimaryColor; }


  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  SetDepartment(d) {
    this.parent.SetDepartment(d);
  }


  ReceivedItemUpdate(workspace, board, group, user, update) {

    combineLatest([this.BoardItems$, this.SubItems$]).pipe(
      take(1)).subscribe( ([items, subitems]) => {

        if (!items || !subitems)
          return;

        let obser: Observable<BoardItem | SubItem> = null;
              let isSubItem = false;
              let entry = _.find(items, i => i.id == update.item_id);

              if (!entry) {
                entry = _.find(subitems, i => i.id == update.item_id);
                if (!entry)
                  return;
                isSubItem = true;

                obser = this.parent.monday.GetSubItem$(update.item_id);
              }
              else {
                obser = this.parent.monday.GetBoardItem$(update.board_id, update.group_id, update.item_id);
              }

              if (!obser)
                return;

              obser.pipe(take(1)).subscribe(
                item => {
                  if (!isSubItem) {
                    this.UpdateBoardItem(new BoardItem(item, workspace, group, board));
                  } else {
                    this.UpdateSubItem(new SubItem(item));
                  }
                }
              )
      });
  }

  User$ = this.parent.userService.User$;

  BoardItemUpdates$ = this.parent.firebase.BoardItemUpdates$
  ngOnInit(): void {
    /*
    this.subscriptions.push(
      combineLatest([this.parent.Workspace$, this.Board$, this.Group$, this.User$, this.BoardItemUpdates$]).subscribe(
        ([workspace, board, group, user, update]) => {

          if (!workspace || !board || !group || !user || !update)
            return;

          if (!workspace.id || board.id != update.board_id || group.id != update.group_id)
            return;

          if (!update.item_id)
            return;

            console.log("Received BoardItem Update,", update);

          this.ReceivedItemUpdate(workspace, board, group, user, update);
        })
    );
      */
    this.initializing = false;
  }

}
