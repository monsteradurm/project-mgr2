import { HttpClient, HttpHeaders } from '@angular/common/http';
import { analyzeNgModules } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'underscore';
import { Board } from '../models/BoardItem';

const _URL_ = environment.syncsketch.url;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': `apikey ${environment.syncsketch.user}:${environment.syncsketch.token}`
  })
};

@Injectable({
  providedIn: 'root'
})
export class SyncSketchService {

  constructor(private http: HttpClient) { 
    this.Projects$.subscribe(r => console.log(r))
  }

  Projects$ = this.QueryArray$('/syncsketch/project/?fields=id,name').pipe(
    shareReplay(1)
  )

  Project$(board: Board) {
    return this.Projects$.pipe(
      map(projects => _.find(projects ? projects : [], p => p.name == board.selection)),
      switchMap(project => project ? this.Query$(`/syncsketch/project/${project.id}/`) : null),
    )
  }
  /*[hamster.dance.gif] birds are drones/facebook.com
  when does mk ultra become actual mind ControlContainer.
  since when do we not get couch cuddles 
  tiggi is boardItems
  anyong analyzeNgModules*/

  Query$(addr: string) {
    return this.http.get(
      `${addr}`, httpOptions).pipe(
        take(1)
      );
  }

  QueryArray$(addr: string) {
    return this.Query$(addr).pipe(
        map((result:any) => result && result.objects ? result.objects : []),
        take(1)
      );
  }
}
