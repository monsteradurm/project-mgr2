import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { ajax } from 'rxjs/ajax';
import { from, timer, of, defer, Observable, combineLatest, BehaviorSubject, throwError, pipe, concat, EMPTY } from 'rxjs';
import { switchMap, tap, shareReplay, map, take, catchError, takeWhile, retryWhen, retry, finalize, concatMap, concatMapTo, mapTo, expand } from 'rxjs/operators';

import mondaySdk from 'monday-sdk-js';
import * as _ from 'underscore';
import { UserService } from './user.service';
import { UserIdentity } from '../models/UserIdentity';
import { Column, MondayIdentity, ScheduledItem } from '../models/Monday';
import { Board, SubItem } from '../models/BoardItem';
import { TimeEntry } from '../models/TimeLog';
import { AngularFirestore } from '@angular/fire/firestore';

const monday = mondaySdk();

const _ENV_ = environment.monday;
const _TENMINUTES_ = 1000 * 60 * 10;
@Injectable({
  providedIn: 'root'
})
export class MondayService {

  constructor(private afs: AngularFirestore) {
    monday.setToken(_ENV_.token);
  }

  private IsReachable = new BehaviorSubject<boolean>(true);
  IsReachable$ = this.IsReachable.asObservable().pipe(shareReplay(1));

  private ComplexityExhausted = new BehaviorSubject<string>(null);
  ComplexityExhausted$ = this.ComplexityExhausted.asObservable();

  TimeTracking$(ids: string[]): Observable<any> {
    let query = `items(ids:[${ids.join(' ')}]){
      id
      updates {
        id
        text_body
      }
    }`

    return this.Query$(query).pipe(
      map((result:any) => result && result.items ? result.items : []),
      map((items) => _.map(items, i => i.updates)),
      map((updates) => _.flatten(updates)),
      map((updates) => _.filter(updates, u => u.text_body.indexOf('TimeEntry') > -1)),
      map((updates) => _.map(updates, u => TimeEntry.parse(u.id, u.text_body))),
      take(1)
      )
  }

  UpdateTimeEntry$(entry: TimeEntry) {
    return this.DeleteTimeEntry$(entry).pipe(
      switchMap(id => this.CreateTimeEntry$(entry)),
      take(1)
    )
  }

  DeleteTimeEntry$(entry: TimeEntry) {
    let m = `delete_update (id: ${entry.id}) {
      id
      }`;

    return this.Mutate$(m).pipe(take(1));
  }
  CreateTimeEntry$(entry: TimeEntry) {
    let m = `create_update (item_id: ${entry.item}, body:${JSON.stringify(
      JSON.stringify(entry.object())
    )}) {
      id
      }`

    return this.Mutate$(m).pipe(take(1));
  }

  MondayUsers$ = this.Query$(
    `users (limit:150) { id name title email is_pending is_view_only is_guest is_admin teams { name } }`
  ).pipe(
    map((res: any) => res && res.users ? res.users : []),
    map((users: any[]) => _.map(users, u => new MondayIdentity(u))),
  ).pipe(take(1), shareReplay(1));

  ProjectSettings$(boardId: string) {
    let query = `boards(limit:1 ids:${boardId}) {
      items { 
        id name 
        column_values { title text type id additional_info value }
        group { title }
      }
  }`
    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data: any) => data.boards[0]),
      map(board => board.items),
      map((items: any[]) => _.groupBy(items, i => i.group.title)),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }

  GetSubItem$(id: string) : Observable<SubItem> | any{
    let query = `items(ids:[${id}] limit:1) {
      id name 
      column_values { title text id additional_info value } }`

    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data: any) => data.items),
      map((items: any[]) => new SubItem(items[0])),
      take(1),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }

  SubItems$(ids: string[]) {

    let query = `items(ids:[${ids.join(' ')}] limit:1000) {
        id name 
        column_values { title text id additional_info value } }`

    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data: any) => data.items),
      map(items => _.map(items, i => new SubItem(i))),
      take(1),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }
  GetBoardItem$(boardId, groupId, itemId) {
    let query = `boards(limit:1 ids:${boardId}) {
      groups(ids:"${groupId}") {
      items(limit:1 ids: ${itemId}) { 
        id name updated_at
        updates(limit:1) { id body creator { id } created_at }
        column_values { title text id additional_info value }
      }
    }
  }`


    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data: any) => data.boards[0].groups[0].items),
      map((items: any[]) => items[0]),
      take(1),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }

  BoardItems$(boardId: string, groupId: string) {
    let query = `boards(limit:1 ids:${boardId}) {
        groups(ids:"${groupId}") {
        items { 
          id name updated_at
          updates(limit:1) { id body creator { id } created_at }
          column_values { title text id additional_info value }
        }
      }
    }`
    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data: any) => data.boards[0].groups[0].items),
      catchError(err => {
        console.log(err);
        return err
      })
    )
  }

  Columns$ = this.Query$(`boards(state:active) { columns { type id title } }`).pipe(
    map((data: any) => data && data.boards ? data.boards : []),
    map((boards: any[]) => _.flatten(_.map(boards, b => b.columns))),
    map((columns: any[]) => _.uniq(columns, c => JSON.stringify(c))),
    map((columns: any[]) => _.map(columns, c => new Column(c))),
    take(1),
    shareReplay(1)
  )

  ColumnsIdsByTitle$(title: string) {
    return this.Columns$.pipe(
      map((columns: Column[]) => _.filter(columns, c => c.title == title)),
      map((columns: Column[]) => _.map(columns, c => c.id))
    )
  }

  ColumnIdsFromTitles$(titles: string[]) {
    return this.Columns$.pipe(
      map((columns: Column[]) => _.filter(columns, c => titles.indexOf(c.title) > -1)),
      map((columns: Column[]) => _.map(columns, c => c.id))
    )
  }

  ColumnValuesFromBoards$(board_ids: string[], col_ids: string[]) {
    let query = `boards(ids:[${board_ids.join(" ")}]) {
        name

        items {
          id
          name
          column_values(ids:["${col_ids.join("\" \"")}"]) {
            id
            title
            value
            additional_info
            text
          }
          board {
            workspace {
              id
              name
            }
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
      map((data: any) => data && data.boards ? data.boards : []),
      map((boards: any) => _.map(boards, b => b.items)),
      map((boardItems: any[]) => _.flatten(boardItems)),
      map((items: any[]) => _.filter(items, i => i.column_values && i.column_values.length > 0))
    )
  }

  /*
  MinBoards$ = this.Query$(`boards(state:active) {
    id, name, workspace_id
  }`).pipe(
    map(result => result['boards']),
    take(1)) */

  GetTags$(boardId: string) {
    let query = `boards(ids:${boardId}){
        items {
          id
          column_values(ids:"tags") {
            id
            text
          }
        }
      }`

    return this.Query$(query).pipe(
      map((data: any) => data && data.boards && data.boards.length > 0 ? data.boards[0] : null),
      map(board => board && board.items ? board.items : []),
      map(items => _.flatten(_.map(items, (i) => i.column_values))),
      map(values => _.uniq(values, (v) => v.text)),
      take(1)
    )
  }
  BoardsByPage$(page=1, result=[]) {
    return this.Query$(`boards(state:active, limit:100, page:${page}) 
    { id, name, 
      columns {
        id
        title
        settings_str
      }
      
      workspace { name, id } 
      groups { id, title }}`)
      .pipe(
        map((data: any) => data && data.boards ? data.boards : []),
        map((boards: any) => _.filter(boards, b => b.workspace)),
        map((boards: any) => _.map(boards, b => new Board(b))),
        map((boards: Board[]) => _.sortBy(boards, b => b.selection)),
        map((boards: Board[]) => ({ result: result.concat(boards), 
          nextPage:  boards.length == 100 ? page + 1 : null}) ),
      ).pipe(take(1))
  }

  Boards$ = this.BoardsByPage$().pipe(
    tap(console.log),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    switchMap((result:any) => result.nextPage ? this.BoardsByPage$(result.nextPage, result.result) : of(result)),
    map((result: any) => result.result),
    take(1),
    shareReplay(1),
  )

  Workspaces$ = this.Boards$.pipe(
    map((boards: Board[]) => _.map(boards, b => b.workspace)),
    map((workspaces: any) => _.filter(workspaces, w => w && w.id)),
    map((workspaces: any) => _.uniq(workspaces, w => w.id)),
    take(1),
    shareReplay(1)
  )

  Projects$ = combineLatest([
    this.Boards$.pipe(
      map((boards: any) => _.filter(boards, b => b.name.indexOf('Subitems of') < 0 &&
      b.workspace && b.workspace.name[0] != "_"))
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
                  let parent = { name: g, children: [] }
                  siblings.push(parent);
                  siblings = parent['children'];
                }
                else {
                  siblings.push({
                    id: b.id,
                    name: g,
                    path: b.name,
                    groups: b.groups
                  });
                  siblings = w.children;
                }
              }
            }) // end grouping
          }); // end boards
        }) // end workspaces
        return workspaces;
      }),
      take(1),
      tap(console.log),
      shareReplay()
    )

  IsComplexityError(errors) {
    if (!errors || errors.length < 1)
      return;
    console.log(errors);
    let error = _.find(errors, e => e.message && e.message.toLowerCase().indexOf('complexity') > -1)
    if (!error) {
      console.log("HERE", errors);
      throw (errors);
    }
    let messageArr = error.message.split(' ')
    return parseInt(messageArr.splice(messageArr.length - 2, 1));

  }

  Mutate$(cmd) {
    return this.API_CMD$(cmd, 'mutation');
  }

  API_CMD$(cmd: string, type: string) {
    return new Observable(observer => {
      monday.api(type + ' { ' + cmd + ' }').then((res) => {
        let cError: number = this.IsComplexityError(res.errors);
        if (cError) {
          
          timer(0, 1000).pipe(
            takeWhile(t => cError > 0)
          ).subscribe(() => {
            this.ComplexityExhausted.next(cError.toString())
            cError -= 1;
            if (cError == 0)
              observer.error({ retry: true })
          })
        }

        else if (res.errors)
          observer.error([res.errors, cmd]);

        else if (!res.data)
          observer.error('No Data!');

        else {
          observer.next(res.data);
          observer.complete();
        }
      })
    }).pipe(
      retry(),
      finalize(() => {
        this.ComplexityExhausted.next(null);
      })
    )
  }

  Pages$ = this.Query$(
    `boards (ids:1212736046){
      items {
        id
        name
        column_values{
          title
          value
          text
        }
      }
    }`
  ).pipe(
    map(arr => arr['boards']),
    map(boards => boards[0]),
    map(board => board['items']),
    shareReplay(1))

  IssueSettings$() {
    let query = `boards(ids:1297042574){
      groups{
        id
        title
        items {
          id
          name
        }
      }`
    return this.Query$(query).pipe(
      map(arr => arr['boards']),
      map(boards => boards[0]),
      take(1)
    )
  }

  ItemIdsFromBoards$(boardids:string[]) {
    let query = `boards(ids:[${boardids.join(' ')}]){
      items{
       id
     }
     }`
     return this.Query$(query).pipe(
       map(arr => arr['boards']),
       map(boards => _.map(boards, b => b.items)),
       map(items => _.flatten(items)),
       map(items => _.map(items, i => i.id)),
       take(1)
     )
  }

  IssueTemplate$ = this.Query$(`boards(ids:1297031115){
    columns{ id settings_str } }`).pipe(
      map(arr => arr['boards'][0]),
      shareReplay(1)
    )
    
  Issues$(Ids: string[]) {
    let query = `	items(ids: [${Ids.join(' ')}]){ id name updated_at
      column_values{ id text additional_info title value }
      board { id name
      workspace{ id name } }
      group { id title }
      updates{ id body updated_at replies { id body updated_at } }
    }`;

    return this.Query$(query).pipe(
      map(arr => arr['items']),
      take(1)
    )
  }
  Query$(cmd) {
    return this.API_CMD$(cmd, 'query').pipe(take(1))
  }

  SetBoardItemStatus$(board_id: string, item_id: string, column_id: string, value: string) {
    let post = `change_simple_column_value (board_id: ${board_id}, item_id: ${item_id}, column_id: "${column_id}", value: "${value}") { id }`
    return this.Mutate$(post).pipe(take(1));
  }


  CreateSubItem$(parent_item_id, item_name) {
    let post = `create_subitem (parent_item_id: ${parent_item_id}, item_name: "${item_name}") 
    { id name }`

    return this.Mutate$(post).pipe(take(1));
  }

  DeleteBoardItem$(item_id) {
    let post = `delete_item (item_id: ${item_id}) { id }`;
    return this.Mutate$(post).pipe(take(1))
  }
}