import { Component, OnInit, OnDestroy, ViewEncapsulation, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized, ActivationEnd } from '@angular/router';
import { filter, map, switchMap, shareReplay, take, tap, repeat, distinctUntilChanged, timestamp, first, withLatestFrom, catchError } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of, race } from 'rxjs';

import { NavigationService } from 'src/app/services/navigation.service';
import { CeloxisService } from '../../../services/celoxis.service';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';
import { MondayService } from '../../../services/monday.service';
import { Department, DepartmentTags } from '../../../models/Department';

const _PAGE_ = '/Projects/Overview';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit, OnDestroy
 {

  constructor(private navigation: NavigationService,
              private monday: MondayService) {
                this.subscriptions.push(
                  this.navigation.PrimaryColor$.subscribe(c => this.PrimaryColor = c)
                )
              }

  PrimaryColor;

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
    //tap(console.log),
  )

  Board$ = combineLatest([this.monday.Boards$, this.NavigationParameters$]).pipe(
    map(([boards, params]) => {
      if (!params['board']) return null;
      return _.find(boards, b => b.id == params['board']);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay(1)
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

  Workspace$ = combineLatest([this.Board$, this.monday.Workspaces$]).pipe(
    map(([board, workspaces]) => {
      if (!board || !workspaces || workspaces.length < 1)
        return of(null);

        return _.find(workspaces, w=> w.id == board.workspace.id);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1)
  )

  GetItemDepartments(tags_column) {
    return DepartmentTags.ToDepartments(tags_column);
  }

  BoardItems$ = combineLatest([this.Board$, this.Group$]).pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    switchMap(([board, group]) =>
    board && board.id && group && group.id ?
    this.monday.BoardItems$(board.id, group.id) : of([])),
    map((items) => _.map(items, i => {
      let arr = i.name.split('/');
      i.task = arr[arr.length - 1];
      i.element = arr[arr.length - 2];
      i.department = this.GetItemDepartments(i.column_values);
      return i;
    })),
    //map((items) => _.filter(items, i=> i.))
    shareReplay(1)
  );

  Departments$ = this.BoardItems$.pipe(
    map(items => _.map(items, i => i.column_values)),
    map(columns => _.map(columns, col => {
        let column = _.find(col, c => c.title == 'Departments')
        if (!column) throw new Error(
          `There is no "Tags" column named "Department" for this workspace/board.
Please request the production data be extended to include this column.`)
        return column;
      }
    )),
    map(values => DepartmentTags.ToDepartments(values)),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
    catchError(err => {
      console.log("ERROR", err.message );
      this.errorMessage.next(err.message);
      return of(null);
    }),
  )

  Department$ = combineLatest([this.Departments$, this.NavigationParameters$]).pipe(
    map(([departments, params]) => {

      if (!departments || departments.length < 1) return null;
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

  SetDepartment(d) {
    combineLatest([this.Board$, this.Group$, this.Department$]).pipe(take(1))
    .subscribe(
      ([board, group, department]) => {

        if (d != department) {
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
          let params = {board: board.id, group: g, deparment: department}
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
              if (wspace)
                titles.push(wspace.name);
              if (board)
                board.name.split('/').forEach(n => titles.push(n));
              this.navigation.SetPageTitles(titles);
          }
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
