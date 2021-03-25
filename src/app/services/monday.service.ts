import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { ajax } from 'rxjs/ajax';
import { from, timer, of, defer, Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap, tap, shareReplay, map, take, catchError } from 'rxjs/operators';

import mondaySdk from 'monday-sdk-js';
import * as _ from 'underscore';

const monday = mondaySdk();

const _ENV_ = environment.monday;
const _TENMINUTES_ = 1000 * 60 * 10;
@Injectable({
  providedIn: 'root'
})
export class MondayService {

  constructor() {
    monday.setToken(_ENV_.token);
  }

  private IsReachable = new BehaviorSubject<boolean>(true);
  IsReachable$ = this.IsReachable.asObservable().pipe(shareReplay(1));

  Users$ = this.Query$('users { id, name }').pipe(
    map((res:any) => res.data && res.data.users ? res.data.users : of([]))
  )

  BoardItems$(boardId: string, groupId: string) {
    let query = `boards(limit:1 ids:${boardId}) {
        groups(ids:"${groupId}") {
        items { id name column_values { title text id additional_info value } }
      }
    }`
    return this.Query$(query.split('\n').join('').trim()).pipe(
      map((data:any) => data.boards[0].groups[0].items),
      catchError(err => [])
    )
  }

  Boards$ = this.Query$('boards(state:active) { id, name, workspace { name, id } groups { id, title }}')
  .pipe(
    map((data:any) => data && data.boards ? data.boards : []),
    map((boards:any) => _.filter(boards, b => b.name.indexOf('Subitems of') < 0)),
    map((boards:any) => _.sortBy(boards, b => b.name))
  );

  Workspaces$ = this.Boards$.pipe(
    map((boards:any) => _.map(boards, b => b.workspace)),
    map((workspaces:any) => _.uniq(workspaces, w => w.id))
  )

  Projects$ = combineLatest([this.Boards$, this.Workspaces$]).pipe(
    map(([boards, workspaces]) => {
      workspaces.forEach(w => {
        w.children = [];
        let siblings = w.children;
        _.filter(boards, b => b.workspace.id == w.id).forEach(b => {
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

/*



#  /*
#  boards(limit:1) {
#    name
#
#    columns {
#      title
#      id
#      type
#    }
#
#    groups {
#    	 title
#      id
#    }

 #   items {
 #     name
 #     group {
 #       id
 #     }
 #
 #     column_values {
 #       id
 #       value
#        text
#      }
#    }
#  }
#}
query {
  boards(
    limit:1
    ids:[1156753578]
  ) {
    	tags {
    	  id
        name
    	}
    	groups(ids:["group_title"]) {
      items {
        id
        name
        column_values {
          title
          value
          text
          id
          type
          additional_info
        }
      }
    }
	}
}

*/
