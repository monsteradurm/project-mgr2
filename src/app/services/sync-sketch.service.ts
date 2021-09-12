import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { analyzeNgModules } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { of } from 'rxjs';
import { delay, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'underscore';
import { Board, BoardItem } from '../models/BoardItem';
import { ScheduledItem } from '../models/Monday';
import { FirebaseService } from './firebase.service';

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

  CACHED_PROJECTS = {};

  Authorization = `apikey ${environment.syncsketch.user}:${environment.syncsketch.token}`;
  constructor(private http: HttpClient, private firebase: FirebaseService) { 
  }

  AllUsers$ = this.Query$(`/syncsketch/account/${_ACCOUNT_}/`).pipe(
    map((account:any) => account.connections),
    map((connections: any[]) => _.map(connections, c=> c.user)),
    shareReplay(1)
  )

  Projects$ = this.QueryArray$('/syncsketch/project/?active=1&fields=id,name')

  Project$(board: Board) {
    return this.Projects$.pipe(
      map(projects => _.find(projects ? projects : [], p => p.name == board.selection)),
      switchMap((project:any) => project ? this.Query$(`/syncsketch/project/${project.id}/`) : of(null)),
      take(1)
    )
  }

  CreateReview(project_id:string, review_name:string) {
    return this.Post$( '/syncsketch/review/', 
        {
          "project": `/api/v1/project/${project_id}/`,
          "name": review_name,
          "description": "",
          "group": "",
          "isPublic" : true,
          "can_download" : true
      }
    ).pipe(
      take(1))
  }
  
  CreateProject(project_name: string) {
    return this.Post$(`/syncsketch/project/`, {
      name: project_name,
      account_id: _ACCOUNT_,
      desciption: ''
    });
  }

  Reviews$(project_id:string) {
    return this.QueryArray$(`/syncsketch/review/?project__id=${project_id}&active=1`)
  }

  Updates$(item_id:string) {
    if (!item_id) return of(null);
    
    return this.QueryArray$(`/syncsketch/frame/?item__id=${item_id}&limit=100`)
  }
  Items$(review_id: string) {
    if (!review_id)
      return of(null);

    return this.QueryArray$(`/syncsketch/item/?reviews__id=${review_id}&active=1
    `);
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
    return this.Patch$(`syncsketch/item/${item_id}/`, {
      name: name,
      can_download: true
    });
  }

  UploadURL(review_id: string) {
    return `/syncsketch-upload/items/uploadToReview/${review_id}/?noConvertFlag=1`
  }

  Upload$(addr:string, data:FormData) {
    return this.http.post(addr, data, uploadOptions);
  }

  Post$(addr:string, body: any) {
    return this.http.post(addr, body, httpOptions).pipe(
      take(1)
    );
  }

  FindReview$(item: BoardItem | ScheduledItem) {
    let fb = this.firebase.SyncSketchReview(item);

    let sel = item.workspace.name + ", " + item.board.name

    if (!this.CACHED_PROJECTS[sel]) {
      this.CACHED_PROJECTS[sel] = 
      this.Projects$.pipe(
        map(projects => _.find(projects, p => p.name == sel)),
        switchMap(project => this.Reviews$(project.id)),
        shareReplay(1)
      )
    }
    
    let name =  `${item.board.id}_${item.group.title}/${item.element}`;

    let cached_reviews = this.CACHED_PROJECTS[sel].pipe(
      map((reviews:any[]) => _.filter(reviews, r => r.name.indexOf(name) == 0)),
      tap(t => console.log("SYNC PROJECT", t))
    )
    /*
    let ss = cached_reviews.pipe(
      switchMap((reviews:any[]) => reviews.length > 0 ? 
        of(reviews) : this.QueryArray$(`/syncsketch/review/?name__istartswith=${item.board.id}_${item.group.title}/${item.element}&active=1`)
      )
    ).pipe(
*/
      return this.QueryArray$(`/syncsketch/review/?name__istartswith=${item.board.id}_${item.group.title}/${item.element}&active=1`)
      .pipe(
      map((results:any[]) => {
        results = _.filter(results, r => r.item_count > 0);

        if (results.length < 1)
          return null;

        if (results.length > 1) {
          let sorted = _  .sortBy(results, r => r.item_count);
          
          return sorted[sorted.length - 1];
        }
        return results[0];
      }),
      take(1)
    )

    /*return fb; .pipe(    
      switchMap(review => review ? of(review).pipe(
        tap( t => console.log("Loaded from SS:", t))) : ss)
    ) */
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
