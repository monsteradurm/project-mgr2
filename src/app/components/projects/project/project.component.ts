import { Component, OnInit, OnDestroy, ViewEncapsulation, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized, ActivationEnd } from '@angular/router';
import { filter, map, switchMap, shareReplay, take, tap, repeat, distinctUntilChanged, timestamp, first, withLatestFrom, catchError } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of, race } from 'rxjs';

import { NavigationService } from 'src/app/services/navigation.service';
import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';
import { MondayService } from '../../../services/monday.service';
import { ColumnValues, ColumnType } from '../../../models/Columns';
import { Board, BoardItem } from 'src/app/models/BoardItem';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { BoxService } from 'src/app/services/box.service';

import {MessageService} from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { ProjectService } from 'src/app/services/project.service';
import { FirebaseService} from 'src/app/services/firebase.service';

const _PAGE_ = '/Projects/Overview';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit, OnDestroy
 {

  constructor(public navigation: NavigationService,
              public syncSketch: SyncSketchService,
              public messenger: MessageService,
              public projectService: ProjectService,
              public firebase: FirebaseService,
              public box: BoxService,
              public userService: UserService,
              public monday: MondayService) {
                this.subscriptions.push(
                  this.navigation.PrimaryColor$.subscribe(c => this.PrimaryColor = c)
                )
              }

  PrimaryColor;

  SetErrorMessage(msg) {
    this.errorMessage.next(msg);
  }

  private internalRouteParams = new BehaviorSubject<any>(null);
  private errorMessage = new BehaviorSubject<string>(null);
 
  InternalRouteParams$ = this.internalRouteParams.asObservable().pipe(shareReplay(1));
  ErrorMessage$ =
  this.errorMessage.asObservable().pipe(
    distinctUntilChanged((a, b) => a == b),
    shareReplay(1));

  NavigationParameters$ = combineLatest([
    this.navigation.NavigationParameters$.pipe(timestamp()),
    this.InternalRouteParams$.pipe(timestamp())]).pipe(
    map(
     ( [nav, internal] ) => {
      if( internal.value == null || nav.timestamp > internal.timestamp ) {
        return nav.value;
      }
      return internal.value
    } ),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  )

  Board$ = combineLatest([this.projectService.Boards$, this.NavigationParameters$]).pipe(
    map(([boards, params]) => {
      if (!params['board']) return null;
      return _.find(boards, b => b.id == params['board']);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay(1)
  )

  Columns$ = this.Board$.pipe(
    map(board => board.columns),
  )

  StatusOptions$ = this.Columns$.pipe(
    map(columns => _.find(columns, c => c.title == "Status")),
    map(status => {
      let settings = JSON.parse(status.settings_str)
      let indices = Object.keys(settings.labels);
      let result = [];
      indices.forEach(i => {
        let option = settings.labels_colors[i];
        option.index = i;
        option.column_id = status.id;
        option.label = settings.labels[i];
        result.push(option);
      });
      return _.sortBy(result, r => r.label);
    }),
    shareReplay(1)
  )

  ProjectSettings$ = combineLatest([this.projectService.Boards$, this.Board$]).pipe(
    switchMap(([boards, current]) => {
      if (!current) return of(null);
      let board = _.find(boards, b=> b.name == "_Settings" && b.workspace_id.toString() == current.workspace.id.toString());
      if (!board) return of(null)
      return this.monday.ProjectSettings$(board.id)
    }),
    shareReplay(1)
  )
  
  ProjectReference$ = this.ProjectSettings$.pipe(
    map(
      settings => {
        if (!settings || !settings['Box Folders'])
          return null;

        let ref =  _.find(settings['Box Folders'], s => s.name == 'Reference');

        if (!ref || !ref.column_values || ref.column_values.length < 1) return null;
        return ref.column_values[0].text;
      }
    )
  )

  Group$ = combineLatest([this.Board$, this.NavigationParameters$]).pipe(
    map(([board, params]) => {
      if (!board || !board.groups) return null;
      let groups = board.groups;
      let groupId = params['group'];

      if (!groupId)
        return groups[0];

      let group = _.find(groups, (g) => g.id == groupId);
      if (!group)
        return groups[0];

      return group;
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
  )

  Workspace$ = combineLatest([this.Board$, this.projectService.Workspaces$]).pipe(
    map(([board, workspaces]) => {
      if (!board || !workspaces || workspaces.length < 1)
        return of(null);

        return _.find(workspaces, w=> w.id == board.workspace.id);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1)
  )

  BoardMilestones$ = this.Board$.pipe(
    switchMap(
      board => {
        if (!board) return of([]);

        let grp = _.find(board.groups, g => g.title == 'Milestones');
        if (grp)
          return this.projectService.GetGroupItem$(board.id, grp.id).pipe(
            map(group => group.items),
            map(items => _.map(items, i => {
              return new BoardItem(i, board.workspace, grp, board)
            }) 
          )
        );
        return of([]);
      }
    ),
  )
  
  BoardItems$ = combineLatest([this.Board$, this.Group$, this.BoardMilestones$]).pipe(
    switchMap(([board, group, milestones]) => {
    if (!board || !board.id || !group || !group.id)
      return of([]);
  
    return this.projectService.GetGroupItem$(board.id, group.id).pipe(
      map(group => group.items),
      map((items) => _.map(items, i => new BoardItem(i, board.workspace, group, board))),
      map(items => milestones.concat(items))
    );

    }),
    catchError(msg => {
      console.log("HERE BOARDITEMS ERROR", msg)
      this.errorMessage.next(msg)
      return of([])
    }),
    shareReplay(1)
  )

  SubItems$ = this.BoardItems$.pipe(
    switchMap(boardItems => {
      if (!boardItems || boardItems.length < 1)
        return of([]);
      
      let filtered = _.filter(boardItems, i => i.subitem_ids && i.subitem_ids.length > 0);
      if (filtered.length < 1)
        return of([]);

      let subgroups = _.map(filtered, i => i.subitem_ids);
      let flattened = _.flatten(subgroups);
      if (flattened.length < 1)
        return of([]);
        
      return this.monday.SubItems$(flattened);
    }),
    shareReplay(1)
  )

  Departments$ = this.BoardItems$.pipe(
    map(items => _.map(items, i=> i.department)),
    map(values => values && values.length > 0 ? values : 
      new Error(
        `There is no "Tags" column named "Department" for this workspace/board.
Please request the production data be extended to include this column.`)
    ),
    map(values => _.uniq(_.flatten(values), v => v.id)),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
    catchError(
      (err, caught) => {
      console.log(err);
      console.log(caught);
      this.errorMessage.next(err.message);
      return [];
    }),
  )

  SyncBoard$ = this.Board$.pipe(
    switchMap(board => this.syncSketch.Project$(board))
  );


  Status$ = this.BoardItems$.pipe(
    map(items => _.map(items, i => i.status)),
    map(items => _.map(items, i => i && i.additional_info && i.additional_info.label ? 
        i.additional_info.label : null)),
    map(status => _.uniq(_.filter(status, s => s))),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
  )

  Artists$ = this.BoardItems$.pipe(
    map(items => _.map(items, i => i.artist)),
    map(items => _.filter(items, i => i)),
    map(items => _.flatten(items)),
    map(items => _.map(items, i => i.text)),
    map(items => _.uniq(items)),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
  )

  Directors$ = this.BoardItems$.pipe(
    map(items => _.map(items, i => i.director)),
    map(items => _.filter(items, i => i)),
    map(items => _.flatten(items)),
    map(items => _.map(items, i => i.text)),
    map(items => _.uniq(items)),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
  )


  Department$ = combineLatest([this.Departments$, this.NavigationParameters$]).pipe(
    map(([departments, params]) => {
      if (!departments || departments < 1) return null;
      let dep = params['department'];

      if (!dep) return departments[0];
      let selected = _.find(departments, d=> d.id == dep);
      if (!selected)
        return departments[0];

      return selected;
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
  )

  Children$ = this.BoardItems$.pipe();

  SetDepartment(d) {
    combineLatest([this.Board$, this.Group$, this.Department$]).pipe(take(1))
    .subscribe(
      ([board, group, department]) => {

        if (d != department.id) {
          this.errorMessage.next(null);
          let params = {board: board.id, group: group.id, department: d.id}

          this.internalRouteParams.next(params)
          this.navigation.Relocate(_PAGE_, params)
        }
      })
  }

  SetGroup(g) {
    combineLatest([this.Board$, this.Group$, this.Department$]).pipe(take(1))
    .subscribe(
      ([board, group, department]) => {
        if (g != group) {
          this.errorMessage.next(null);
          let params = {board: board.id, group: g};
          
          if (department && department.id)
            params['department'] = department.id;

          this.internalRouteParams.next(params)
          this.navigation.Relocate(_PAGE_, params)
        }
      })
  }

  subscriptions = [];
  ngOnInit(): void {
    this.errorMessage.next(null);

    this.subscriptions.push(
      combineLatest(
        [this.Workspace$, this.Board$]).subscribe(
          ([wspace, board]) => {
              let titles = []
              if (wspace && wspace.name)
                titles.push(wspace.name.replace('_', ' '));
              if (board && board.name)
                board.name.split('/').forEach(n => titles.push(n.replace('_', ' ')));
              
              if (titles.length > 0)
                this.navigation.SetPageTitles(titles);
          }
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
