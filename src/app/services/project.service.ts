import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Board, BoardItem } from '../models/BoardItem';
import { MondayIdentity, ScheduledItem } from '../models/Monday';
import { MondayService } from './monday.service';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';
import * as _ from 'underscore';
import { combineLatest, Observable, of } from 'rxjs';
import { FirebaseUpdate } from '../models/Firebase';
import { shareReplayUntil } from '../models/shareReplayUntil';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private monday: MondayService,
    private userService: UserService,
    private firebase: FirebaseService,
    private messenger: MessageService) {
  }

  GroupItems$ = {}
  User$ = this.userService.User$;
  Projects$ = combineLatest([
    this.monday.Projects$, this.userService.UserIsRemote$, this.userService.RemoteProjectIds$
  ])
    .pipe(
      map(([projects, isRemote, remoteProjects]) => {
        if (!isRemote)
          return projects;

        return _.filter(projects, p => {
          let valid = false;
          _.forEach(remoteProjects, r => {
            if (p.name.toLowerCase().startsWith(r.toLowerCase())) {
              valid = true;
            }
          });
          return valid;
        })
      }), 
      shareReplay(1)
    );
  
  /*this.firebase.Projects$.pipe(
    switchMap((entry) => {
      let update = new FirebaseUpdate(entry);
      if (update.hasExpired()) {
        return this.monday.Projects$.pipe(
          tap(projects => 
            this.firebase.CacheProjects(FirebaseUpdate.create(projects)),
          )
        )
      }
      console.log("Using cached Projects$")
      return of(update.asArray());
    }),
    tap(console.log),
    shareReplay(1)
  )*/
  
  Boards$ = this.monday.Boards$.pipe(shareReplay(1));

  /*
  this.firebase.Boards$.pipe(
    switchMap((entry) => {
      let update = new FirebaseUpdate(entry);
      if (update.hasExpired()) {
        return this.monday.Boards$.pipe(
          tap(boards => 
            this.firebase.CacheBoards(FirebaseUpdate.create(boards)),
          )
        )
      }
      console.log("Using cached Boards$")
      return of(update.asArray());
    }),
    shareReplay(1)
  ) */

  GetGroupItem$(board_id: string, group_id: string): Observable<any> {
    const key = board_id + '_' + group_id;
    if (!this.GroupItems$[key]) {
      this.GroupItems$[key] = this.firebase.GetGroupItems$(board_id, group_id);
    }

    return this.GroupItems$[key];
  }

  Workspaces$ = this.Boards$.pipe(
    map((boards: Board[]) => _.map(boards, b => b.workspace)),
    map((workspaces: any) => _.filter(workspaces, w => w && w.id)),
    map((workspaces: any) => _.uniq(workspaces, w => w.id)),
    take(1),
    shareReplay(1)
  )

  QueryStatusChanged(item, column) {
    let label = column.label;
    if (
      (!item.status && label == "Not Started") ||
      (item.status && (!item.status.text && label == "Not Started")) ||
      (item.status && (label == item.status.text))
    ) {
      this.messenger.add({
        severity: 'info',
        summary: 'Status is already "' + label + '"',
        life: 3000,
        detail: item.name
      });
      return false;
    }
    return true;
  }

  //MinBoards$ = this.monday.MinBoards$.pipe(shareReplay(1))

  GetProjectSettings$(workspace_id) {
      return this.Boards$.pipe(
      switchMap(boards => {
        let board = _.find(boards, b=> b.workspace && b.name == "_Settings" && b.workspace.id.toString() == workspace_id.toString());
        if (!board) return of(null)
        return this.monday.ProjectSettings$(board.id)
      }),
      take(1)
    )
  }

  GetStatusOptions$(boardid) {
    return this.Boards$.pipe(
      map(boards => _.find(boards, b => b.id == boardid)),
      map(board => board.columns),
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
      take(1)
    )
  }
  SetItemStatus(boardid: string, item: BoardItem | ScheduledItem, column: any) {
    return this.monday.SetBoardItemStatus$(boardid, item.id.toString(), column.column_id, column.index)
      .pipe(
        take(1),
        map((result:any) => {
          if (result && result.change_simple_column_value && result.change_simple_column_value.id) {
            this.messenger.add({ severity: 'success', summary: 'Status Updated', detail: item.name });
  
            this.firebase.SendBoardItemUpdate(boardid, item.group.id, item.id);
            return true;
          } else {
            this.messenger.add({ severity: 'error', summary: 'Error Updating Status', detail: item.name })
            return false;
          }
        })
      )
  }
}