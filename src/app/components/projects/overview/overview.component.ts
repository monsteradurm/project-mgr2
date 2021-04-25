import { Component, OnInit, OnDestroy, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, ApplicationRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectComponent } from '../project/project.component';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, shareReplay, timestamp, take, switchMap } from 'rxjs/operators';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';

import * as _ from 'underscore';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { Tag } from 'src/app/models/Columns';
import { BoxService } from 'src/app/services/box.service';
import { OverviewGanttComponent } from './overview-gantt/overview-gantt.component';
import { OverviewSubitemComponent } from './overview-subitem/overview-subitem.component';
import * as moment from 'moment';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewChecked {

  initializing = true;
  subscriptions = [];
  Fetching = true;
  constructor(public parent: ProjectComponent,
    private changeDetector: ChangeDetectorRef,
    private actionOutlet: ActionOutletFactory) {
  }

  SubItems$ = this.parent.SubItems$;

  private groupMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('group_work');
  private updatedBoardItems = new BehaviorSubject<BoardItem[]>(null);

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

  private selectedElement = new BehaviorSubject<BoardItem>(null);
  SelectedElement$ = this.selectedElement.asObservable().pipe(shareReplay(1));

  SortByOptions = ['Name', 'Item Code', 'Status', 'Resources', 'Start', 'Finish'];

  statusMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Status').setIcon('library_add_check');
  artistsMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Artists').setIcon('person');
  directorsMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Directors').setIcon('supervisor_account')
  sortByMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Sort By').setIcon('sort_by_alpha');

  UpdatedBoardItems$ = this.updatedBoardItems.asObservable().pipe(shareReplay(1))
  SyncReviews$ = this.parent.SyncReviews$;

  private get box() { return this.parent.box; }

  GanttView: OverviewGanttComponent;
  @Output() Expanded: string[] = [];

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

  onViewTaskClosed() {
    this.selectedElement.next(null);
  }

  SetReverseSorting() {
    this.ReverseSorting$.pipe(take(1)).subscribe(state => this.reverseSorting.next(!state));
  }

  onSelectItem(item) {
    this.SelectedElement$.pipe(take(1)).subscribe(el => {
      if (el && el.id && item && item.id && el.id != item.id) {
        this.selectedElement.next(item);
      }
      else if (!el && item && item.id) {
        this.selectedElement.next(item);
      }
      else if (el && !item) {
        this.selectedElement.next(null);
      }
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
  Group$ = this.parent.Group$;
  Departments$ = this.parent.Departments$;
  Department$ = this.parent.Department$;
  ErrorMessage$ = this.parent.ErrorMessage$;
  Status$ = this.parent.Status$;
  Artists$ = this.parent.Artists$;
  Directors$ = this.parent.Directors$;

  BoardWidth;
  GanttWidth;
  onBoardsResize(evt) {
    this.BoardWidth = evt.width;
    this.GanttWidth = window.innerWidth - evt.width;
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

  SetArtistsFilter(s) {
    if (this.initializing) return;
    this.IgnoredArtists$.pipe(take(1)).subscribe(options => {
      let result = [...options];
      let index = options.indexOf(s);
      if (index > -1)
        result.splice(index, 1);
      else
        result.push(s);

      this.ignoredArtists.next(result.sort());
    });
  }

  SetDirectorsFilter(s) {
    if (this.initializing) return;
    this.IgnoredDirectors$.pipe(take(1)).subscribe(options => {
      let result = [...options];
      let index = options.indexOf(s);
      if (index > -1)
        result.splice(index, 1);
      else
        result.push(s);

      this.ignoredDirectors.next(result.sort());
    });
  }

  SetStatusFilter(s) {
    if (this.initializing) return;

    combineLatest([this.Status$, this.IgnoredStatus$]).pipe(take(1)).subscribe(
      ([options, ignored]) => {
        if (ignored.length == 0) {
          this.ignoredStatus.next(_.filter(options, o => o != s))
          return;
        }

        if (ignored.indexOf(s) < 0)
          ignored.push(s)
        else
          ignored = _.filter(ignored, i => i != s);

        if (ignored.length == options.length)
          ignored = [];

        this.ignoredStatus.next(ignored);
      });
  }

  SortByMenu$ = combineLatest([this.SortBy$, this.ReverseSorting$]).pipe(
    map(([sortBy, doReverse]) => {
      this.initializing = true;
      this.sortByMenu.removeChildren();
      this.sortByMenu.setTitle('Sort By ' + sortBy)
      this.SortByOptions.forEach(o => {
        this.sortByMenu.createButton().setTitle(o).setIcon(!doReverse ? 'north' : 'south')
          .fire$.subscribe(a => this.SetSortBy(o));
      })
      this.sortByMenu.createGroup().createButton()
        .setTitle('Reverse').setIcon('flip_camera_android').fire$.subscribe(
          a => this.SetReverseSorting()
        );

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
      board.groups.forEach(g => this.groupMenu.createButton()
        .setTitle(g.title).fire$.subscribe(a => this.SetGroup(g.id)));
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


  ngOnInit(): void {
    this.initializing = false;
  }

}
