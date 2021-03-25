import { Component, OnInit, OnDestroy, ViewEncapsulation, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized, ActivationEnd } from '@angular/router';
import { filter, map, switchMap, shareReplay, take, tap, repeat, distinctUntilChanged, timestamp, first, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of, race } from 'rxjs';

import { NavigationService } from 'src/app/services/navigation.service';
import { CeloxisService } from '../../../services/celoxis.service';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';
import { MondayService } from '../../../services/monday.service';

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
  InternalRouteParams$ = this.internalRouteParams.asObservable().pipe(shareReplay(1));

  NavigationParameters$ = combineLatest([
    this.navigation.NavigationParameters$.pipe(tap(console.log), timestamp()),
    this.InternalRouteParams$.pipe(timestamp())]).pipe(
    map(
     ( [nav, internal] ) => {
      if( internal.value == null || nav.timestamp > internal.timestamp ) {
        return nav.value;
      }
      return internal.value
    } ),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
    shareReplay(1),
    //tap(console.log),
  )
  
  Board$ = combineLatest([this.monday.Boards$, this.NavigationParameters$]).pipe(
    map(([boards, params]) => {
      if (!params['board']) return null;
      return _.find(boards, b => b.id == params['board']);
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
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
    shareReplay(1)
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

  Department$ = of(null);

  SetGroup(g) {
    combineLatest([this.Board$, this.Group$, this.Department$]).pipe(take(1))
    .subscribe(
      ([board, group, department]) => {
        if (g != group) {
          let params = {board: board.id, group: g, deparment: department}
          this.internalRouteParams.next(params)
          this.navigation.Relocate(_PAGE_, params)
        }
      })
  }

  BoardItems$ = combineLatest([this.Board$, this.Group$]).pipe(
    switchMap(([board, group]) => 
    board && board.id && group && group.id ?
    this.monday.BoardItems$(board.id, group.id) : of([]))
  );

  subscriptions = [];
  ngOnInit(): void {
    
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
