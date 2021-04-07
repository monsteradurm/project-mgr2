import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, shareReplay, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'underscore';

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

  Project(workspace: string, board:string) {
    return this.Projects$.pipe(

    )
  }
  QueryArray$(addr: string, page=1) {
    return this.http.get(
      `${addr}`, httpOptions).pipe(
        map((result:any) => result && result.objects ? result.objects : []),
        take(1)
      );
  }
}
