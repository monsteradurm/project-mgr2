import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { ajax } from 'rxjs/ajax';
import { from, timer, of, defer, Observable, combineLatest, BehaviorSubject, throwError } from 'rxjs';
import { switchMap, tap, shareReplay, map, take, catchError } from 'rxjs/operators';

import mondaySdk from 'monday-sdk-js';
import * as _ from 'underscore';
import { UserService } from './user.service';
import { UserIdentity } from '../models/UserIdentity';
import { Column, MondayIdentity } from '../models/Monday';

const monday = mondaySdk();

const _ENV_ = environment.monday;
const _TENMINUTES_ = 1000 * 60 * 10;
@Injectable({
  providedIn: 'root'
})
export class MondayService {

  constructor(private UserService: UserService) {
    monday.setToken(_ENV_.token);
    this.Columns$.subscribe(console.log)
  }

  private IsReachable = new BehaviorSubject<boolean>(true);
  IsReachable$ = this.IsReachable.asObservable().pipe(shareReplay(1));

  
  MondayUsers$ = this.UserService.AllUsers$.pipe(
    switchMap((users:any[]) => 
      this.Query$(
        `users(limit:${users.length}) { id name title email is_pending is_view_only is_guest is_admin teams { name } }`
      )
    ),
    map((res:any) => res && res.users ? res.users : []),
    map((users:any[]) => _.map(users, u => new MondayIdentity(u))),
  ).pipe(take(1));

  SubItems$(ids: string[]) {
    let query = `items(ids:[${ids.join(",")}]) { 
      id name 
          updates(limit:1) { id body creator { id } created_at }
          column_values { title text id additional_info value }
    }`

    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data:any) => data.items),
      tap(t => console.log("SUBITEMS", t))
    )
  }

  BoardItems$(boardId: string, groupId: string) {
    let query = `boards(limit:1 ids:${boardId}) {
        groups(ids:"${groupId}") {
        items { 
          id name 
          updates(limit:1) { id body creator { id } created_at }
          column_values { title text id additional_info value }
        }
      }
    }`
    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data:any) => data.boards[0].groups[0].items),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }

  Columns$ = this.Query$(`boards(state:active) { columns { type id title } }`).pipe(
    map((data:any) => data && data.boards ? data.boards : []),
    map((boards:any[]) => _.flatten(_.map(boards, b=> b.columns))),
    map((columns: any[]) => _.uniq(columns, c => JSON.stringify(c))),
    map((columns:any[]) => _.map(columns, c => new Column(c))),
    shareReplay(1)
  )
  
  ColumnsIdsByTitle$(title:string) {
    return this.Columns$.pipe(
      map((columns:Column[]) => _.filter(columns, c=> c.title == title)),
      map((columns:Column[]) => _.map(columns, c=> c.id))
    )
  }

  ColumnIdsFromTitles$(titles: string[]) {
    return this.Columns$.pipe(
      map((columns:Column[]) => _.filter(columns, c=> titles.indexOf(c.title) > -1)),
      map((columns:Column[]) => _.map(columns, c=> c.id))
    )
  }

  ColumnValuesFromBoards$(board_ids: string[], col_ids: string[]) {
    let query = `boards(ids:[${board_ids.join(" ")}]) {
        name
        items {
          id
          name
          column_values(ids:["${col_ids.join("\" \"")}"]) {
            title
            value
          }
          board {
            id
            name
          }
          group {
            id
            title
          }
        }
      } complexity { query } `

    return this.Query$(query).pipe(
      map((data:any) => data && data.boards ? data.boards : []),
      map((boards:any) => _.map(boards, b => b.items)),
      map((boardItems: any[]) => _.flatten(boardItems)),
      tap(console.log),
      map((items: any[]) => _.filter(items, i => i.column_values && i.column_values.length > 0))
    )
  }

  Boards$ = this.Query$(`boards(state:active) 
  { id, name, 
    workspace { name, id } 
    groups { id, title }}`)
  .pipe(
    map((data:any) => data && data.boards ? data.boards : []),
    //map((boards:any) => _.filter(boards, b => b.name.indexOf('Subitems of') < 0)),
    map((boards:any) => _.sortBy(boards, b => b.name))
  );

  Workspaces$ = this.Boards$.pipe(
    map((boards:any) => _.map(boards, b => b.workspace)),
    map((workspaces:any) => _.filter(workspaces, w => w && w.id)),
    map((workspaces:any) => _.uniq(workspaces, w => w.id))
  )



  Projects$ = combineLatest([
    this.Boards$.pipe(
      map((boards:any) => _.filter(boards, b => b.name.indexOf('Subitems of') < 0))
    ), 
    this.Workspaces$]).pipe(
    map(([boards, workspaces]) => {

      workspaces.forEach(w => {
        w.children = [];
        let siblings = w.children;
        _.filter(boards, b => b && b.workspace && b.workspace.id == w.id).forEach(b => {
            let grouping = b.name.split('/');
            let last = grouping[grouping.length - 1];

            grouping.forEach(g => {

              let index = _.findIndex(siblings, p => p.name == g);
              if (index >= 0)
                siblings = siblings[index].children;
              else {

                if (g != last) {
                  let parent = { name: g, children: []}
                  siblings.push(parent);
                  siblings = parent['children'];
                }
                else {
                  siblings.push({
                    id: b.id,
                    name: g,
                    path: b.name,
                    groups: b.groups});
                  siblings = w.children;
                }
              }
            }) // end grouping
        }); // end boards
      }) // end workspaces
      return workspaces;
    }),
  )

  Query$(query) {
    return new Observable( observer => {
      monday.api('query { ' + query + ' }').then((res) => {
        if (res.errors)
          observer.error([res.errors, query]);
        else if (!res.data)
          observer.error('No Data!');


        observer.next(res.data);
        observer.complete();
      })
    }).pipe(take(1))
  }
}