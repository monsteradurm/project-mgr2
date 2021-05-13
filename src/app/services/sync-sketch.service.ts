import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { analyzeNgModules } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'underscore';
import { Board } from '../models/BoardItem';

const _URL_ = environment.syncsketch.url;
const _ACCOUNT_ = '116681'
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': `apikey ${environment.syncsketch.user}:${environment.syncsketch.token}`
  })
};

const uploadOptions = {
  headers: new HttpHeaders({
    'Authorization': `apikey ${environment.syncsketch.user}:${environment.syncsketch.token}`
    }),
    observe: 'events' as 'events',
    reportProgress: true,  
}

const _BLANKPROJECT_ = 152336;

@Injectable({
  providedIn: 'root'
})
export class SyncSketchService {

  Authorization = `apikey ${environment.syncsketch.user}:${environment.syncsketch.token}`;
  constructor(private http: HttpClient) { 
  }
  AllUsers$ = this.Query$(`/syncsketch/account/${_ACCOUNT_}/`).pipe(
    map((account:any) => account.connections),
    map((connections: any[]) => _.map(connections, c=> c.user)),
    shareReplay(1)
  )

  Projects$ = this.QueryArray$('/syncsketch/project/?active=1&fields=id,name').pipe(
    shareReplay(1)
  )

  Project$(board: Board) {
    return this.Projects$.pipe(
      map(projects => _.find(projects ? projects : [], p => p.name == board.selection)),
      switchMap((project:any) => project ? this.Query$(`/syncsketch/project/${project.id}/`) : null),
    )
  }

  CreateReview(project_id:string, review_name:string) {
    return this.Post$( '/syncsketch/review/', 
        {
          "project": `/api/v1/project/${project_id}/`,
          "name": review_name,
          "description": "",
          "group": ""
      }
    )
    
  }
  
  CreateProject(project_name: string) {
    return this.Post$(`/syncsketch/project/`, {
      name: project_name,
      account_id: _ACCOUNT_,
      desciption: ''
    });
  }

  Reviews$(project_id:string) {
    return this.QueryArray$(`/syncsketch/review/?project__id=${project_id}&active=1`).pipe(tap(console.log))
  }

  Updates$(item_id:string) {
    return this.QueryArray$(`/syncsketch/frame/?item__id=${item_id}&limit=100`).pipe(tap(console.log))
  }
  Items$(review_id: string) {
    return this.QueryArray$(`/syncsketch/item/?reviews__id=${review_id}&active=1
    `)
  }

  RemoveItems$(ids: string[]) {
    return this.Post$('/syncsketch-v2/bulk-delete-items/', {
      item_ids: ids
    });
  }

  RemoveItem$(id: string) {
    return this.Delete$('/syncsketch/item/' + id)
  }

  Delete$(addr) {
    return this.http.delete(addr, httpOptions).pipe(
      take(1)
    );
  }
  RenameItem$(item_id: string, name: string) {
    return this.Patch$(`syncsketch/item/${item_id}/`, {name: name});
  }

  UploadURL(review_id: string) {
    return `/syncsketch-upload/items/uploadToReview/${review_id}/?noConvertFlag=0`
  }

  Upload$(addr:string, data:FormData) {
    return this.http.post(addr, data, uploadOptions);
  }

  Post$(addr:string, body: any) {
    return this.http.post(addr, body, httpOptions).pipe(
      take(1)
    );
  }

  FindReview$(board_id: string, group_title: string, element:string) {
    console.log("FINDING REVIEW", board_id, group_title, element)
    return this.QueryArray$(`/syncsketch/review/?name__istartswith=${board_id}_${group_title}/${element}&active=1`).pipe(
      map(results => results.length < 1 ? null : results[0]),
      take(1)
    )
  }

  Patch$(addr:string, body: any) {
    return this.http.patch(addr, body, httpOptions).pipe(
      take(1)
    );
  }

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
