import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { analyzeNgModules } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { of, pipe } from 'rxjs';
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
  
  //LADUS0021_MagicMoments, HollywoodStudios/Character
  //LADUS0021_MagicMoments, HollywoodStudios/Characters
  Projects$ = this.QueryArray$('/syncsketch/project/?active=1&fields=id,name&limit=999')

  Project$(board: Board) {
    
    let selection = board.selection;
    if (selection.length > 50)
      selection = selection.substr(0, 50);

    return this.Projects$.pipe(
      map(projects => _.filter(projects ? projects : [], p => p.name == selection)),
      map(projects => _.sortBy(projects, p => p.review_count)),
      map(projects => projects.length > 0 ? projects[projects.length - 1] : null),
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
    return this.QueryArray$(`/syncsketch/review/?project__id=${project_id}&active=1&limit=999`)
  }

  Updates$(item_id:string) {
    if (!item_id) return of(null);
    
    return this.QueryArray$(`/syncsketch/frame/?item__id=${item_id}&limit=999`)
  }

  Items$(review_id: string) {
    if (!review_id)
      return of(null);

    return this.QueryArray$(`/syncsketch/item/?reviews__id=${review_id}&active=1&limit=999
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
    return  this.firebase.SyncSketchReview(item);
  }

  Patch$(addr:string, body: any) {
    return this.http.patch(addr, body, httpOptions).pipe(
      take(1)
    );
  }
  GetThumbnail$(id) {
    return this.Query$('/syncsketch/item/' + id  +'/?active=1&fields=thumbnail_url').pipe(
      take(1),
      map((item:any) => item.thumbnail_url)
    )
  }
  PostReviewUpdate(item: BoardItem | ScheduledItem, review_id) {
    let ws = item.workspace.name;
    let board = item.board.name;
    let boardid = item.board.id;
    let group = item.group.title;

    let project_name = ws +', ' + board;
    let review_name = boardid + "_" + group + '/' + item.element;

    let data = {
      review: {name: review_name, id: review_id },
      project: {name: project_name },
    }

    this.http.post('/cloud-functions/SSUpdateItem', 
      data, { 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          },
      }).pipe(take(1)).subscribe((res) => console.log("CLOUD: ", res) )
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
