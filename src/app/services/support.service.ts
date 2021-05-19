import { Injectable } from '@angular/core';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { UserService } from './user.service';
import * as _ from 'underscore';
import { MondayService } from './monday.service';
import { Issue } from '../models/Issues';
import { MessageService } from 'primeng/api';
import { SocketService } from './socket.service';

const _ISSUE_SETTINGS_ = '1297042574'
const _PM_Issues_ = '1297738308'

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private projectService:ProjectService, 
    private messenger: MessageService,
    private socket: SocketService,
    private monday: MondayService) { }

  MinBoards$ = this.projectService.MinBoards$;

  IssueBoardsIds$ = this.MinBoards$.pipe(
      map((min:any[]) => {
        if (!min) return;
        return  _.map(_.filter(min, (b) => b.name == '_Issues'), (b) => b.id.toString());
      }),
      map((ids:string[]) => _.filter(ids, i => i != _PM_Issues_)),
  )
  
  Issues$ = this.IssueBoardsIds$.pipe(
    switchMap(ids => this.monday.ItemIdsFromBoards$([_PM_Issues_].concat(ids))),
    switchMap((ids:string[]) => this.monday.Issues$(ids)),
    map(issues => _.filter(issues, i => i.board.workspace != null)),
    map(issues => _.map(issues, i => Issue.parse(i))),
  )

  IssueUpdates$ = this.socket.IssueUpdates$;

  IssueTemplate$ = this.monday.IssueTemplate$;
  StatusOptions$ = this.IssueTemplate$.pipe(
    map(template => template.columns),
    map(columns => _.find(columns, c => c.id == 'status')),
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
  IssueSettings$ = this.monday.IssueSettings$().pipe(shareReplay(1))

  WebServiceOptions$ = this.IssueSettings$.pipe(
    map(settings => settings.groups),
    map(groups => _.find(groups, (g) => g.name == 'Web Services')),
    map(group => group.items),
    shareReplay(1)
  )

  ApplicationOptions$ = this.IssueSettings$.pipe(
    map(settings => settings.groups),
    map(groups => _.find(groups, (g) => g.name == 'Applications')),
    map(group => group.items),
    shareReplay(1)
  )

  RenderOptions$ = this.IssueSettings$.pipe(
    map(settings => settings.groups),
    map(groups => _.find(groups, (g) => g.name == 'Render Engines')),
    map(group => group.items),
    shareReplay(1)
  )

  TeamOptions$ = this.IssueSettings$.pipe(
    map(settings => settings.groups),
    map(groups => _.find(groups, (g) => g.name == 'Teams/Departments')),
    map(group => group.items),
    shareReplay(1)
  )

  SetItemStatus(boardid: string, item: Issue, column: any) {
    if (!this.projectService.QueryStatusChanged(item, column))
      return;

    this.monday.SetBoardItemStatus$(boardid, item.id.toString(), column.column_id, column.index)
      .pipe(take(1))
      .subscribe((result: any) => {
        if (result && result.change_simple_column_value && result.change_simple_column_value.id) {
          this.messenger.add({ severity: 'success', summary: 'Status Updated', detail: item.name });

          this.socket.SendIssueUpdate();

        } else {
          this.messenger.add({ severity: 'error', summary: 'Error Updating Status', detail: item.name })
        }
      })
  }
}
