import { Injectable } from '@angular/core';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { UserService } from './user.service';
import * as _ from 'underscore';
import { MondayService } from './monday.service';

const _ISSUE_SETTINGS_ = '1297042574'
const _PM_Issues_ = '1297738308'

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private projectService:ProjectService, private monday: MondayService) { }

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
    switchMap(ids => this.monday.Issues$(ids)),
    tap(console.log),
    take(1)
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
}
