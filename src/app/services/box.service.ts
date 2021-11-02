import { EventEmitter, Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler, HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, retry, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { BoardItem } from '../models/BoardItem';

const _GALLERY_: string = '135589920910';
const _LETTERS_: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
                            'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
                            't', 'u', 'v', 'w', 'x', 'y', 'z']

const _SEARCH_ANY_ : string = _LETTERS_.join(' OR ');
const httpOptions = {
  headers: new HttpHeaders(
    { 'Content-Type': 'application/json'}
  )
};

const authOptions = {
  headers: new HttpHeaders(
    { 'Content-Type': 'application/x-www-form-urlencoded'}
  )
};

const authData =
    'client_id=' + environment.box.boxAppSettings.clientID +'&' +
    'client_secret=' +  environment.box.boxAppSettings.clientSecret + '&' +
    'box_subject_type=enterprise&' +
    'box_subject_id=' + environment.box.enterpriseID + '&' +
    'grant_type=client_credentials'

@Injectable({
  providedIn: 'root'
})
export class BoxService {

  Gallery_ID = _GALLERY_;

  private refreshToken = new BehaviorSubject<boolean>(true);
  RefreshToken$ = this.refreshToken.asObservable();

  constructor(private http: HttpClient) { 
  }

  ReferenceFolder$(root:string) : Observable<any>{
    return this.http.get('/box-rest/subfolder?root=' + root + '&folder=Reference').pipe(
      tap(t => console.log("Subfolder", t)),
      take(1)
    )
  } 

  SubFolder$(parent:string, name: string) {
    return this.http.get('/box-rest/subfolder?root=' + parent + '&folder=' + name).pipe(
      tap(t => console.log("Subfolder", name, t)),
      take(1)
    )
  }
  GetFolder$(id: string) {
    return this.Query$('/box/folders/' + id);
  }

  createImageFromBlob(image: Blob): Observable<any> {
    return new Observable( (subscriber) => {
      const reader = new FileReader();
      reader.addEventListener('load', (
      ) => {
        subscriber.next(reader.result);
     }, false);

      if (image) {
        reader.readAsDataURL(image);
     }
    });
  }

  FindNestedFolder(path: string[], anscestor:string, create_if_missing: boolean) {  
    console.log("FIND NESTED", path, anscestor);
    let chain = this.QueryFolderExists_AnscestorId(anscestor, path[0], create_if_missing)
    for(let p = 1; p < path.length; p++) {
      
      chain = chain.pipe(
        switchMap(parent => parent && parent.id ? 
          this.QueryFolderExists_AnscestorId(parent.id, path[p], create_if_missing) : of(null)
        ),
        tap(t=> console.log(t, path[p]))
      )
    }
    return chain;
  }


  CreateFolder(anscestor, name) {

    return this.Post$('/box/folders', {
      name: name,
      parent: {
        id: anscestor
      }
    })
  }

  QueryFolderExists_AnscestorId(anscestor, subfolder_name, create: boolean) {
    if (!anscestor || !subfolder_name) return null; 
    return this.GetFolder$(anscestor).pipe(
      map((folder:any) => this.QueryFolderExists_Anscestor(folder, subfolder_name)),
      switchMap(parent => parent && parent.id? of(parent) : 
        create ? this.CreateFolder(anscestor, subfolder_name) : of(null)
      ),
    )
  }

  QueryFolderExists_Anscestor(anscestor, subfolder_name) {

    if (!anscestor || !anscestor.item_collection)
      return null;

    let entries = anscestor.item_collection.entries;
    return _.find(entries, e=> e.type == 'folder' && e.name == subfolder_name);
  }

  Create_SharedLink$(id) {
    return this.Headers$.pipe(
        switchMap(headers => this.http.put(
        '/box/files/' + id +'?fields=shared_link', {
          "shared_link": {
            "access": 'open',      
            "permissions": {
              "can_download": false
            }
          }
        },
        headers).pipe(take(1))
      )
    )
  }

  SharedLink$(id) {
    return this.Query$('/box/files/' + id).pipe(
      switchMap((item:any) => item && item.shared_link ? of(item) 
      : this.Create_SharedLink$(id))
      )
  }

  Thumbnail$(box_file) {
    let arr = box_file.name.split('.');
    if (arr.length < 1)
      return null;
    
    let extension = arr[arr.length - 1];

    return this.Token$.pipe(
      switchMap(token => 
        this.http.get(
          `/box/files/${box_file.id}/thumbnail.png?max_height=320&max_width=320`, 
          { responseType: 'blob',
            headers: new HttpHeaders(
            { 
              'Content-Type' : 'blob',
              'Authorization' : 'Bearer ' + token 
            })
          }
        )
      ),
      switchMap((b: Blob) => this.createImageFromBlob(b)),
      take(1)
    )
  }

  Token$ = this.RefreshToken$.pipe(
    switchMap(refresh => this.http.post('https://api.box.com/oauth2/token/', authData, authOptions)),

    map(response =>{ 
      if (!response || !response['access_token'])
        throw 'Invalid Token';
    return response['access_token']
    }),
    retry(10),
    shareReplay(1),
    
  )

  Download$(id:string) { 
    return this.Token$.pipe(
      switchMap(token => 
        this.http.get(
          `/box/files/${id}/content`, 
          { responseType: 'blob',
            headers: new HttpHeaders(
            { 
              'Content-Type' : 'blob',
              'Authorization' : 'Bearer ' + token 
            })
          }
        )
      ),
      switchMap((b: Blob) => this.createImageFromBlob(b)),
      take(1)
    )
  }
  
  Headers$ = this.Token$.pipe(
    map(token =>  ({
        headers: new HttpHeaders(
          { 'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + token}
        )
      }), 
    ),
  )

  Post$(addr:string, body:any) {
    return this.Headers$.pipe(
      switchMap(headers => this.http.post(addr, body, headers)),
      take(1)
    )
  }

  DeleteWebhook$(id) {
    return this.Delete$('/box/webhooks/' + id);
  }

  AddWebhook$(target, triggers, address) {
    return this.Post$('/box/webhooks', { target, triggers, address })
  }

  Query$(addr: string) {
    return this.Headers$.pipe(
      switchMap(headers => this.http.get(addr, headers)),
      take(1), 
    )
  }

  Delete$(addr: string) {
    return this.Headers$.pipe(
      switchMap(headers => this.http.delete(addr, headers)),
      take(1)
    )
  }

  GroupFolders(parents, remaining) {

    _.forEach(parents, p=> {
        let children = _.filter(remaining, c => c.parent.id == p.id);
        let orphans = _.filter(remaining, c => c.parent.id != p.id);
        p.children = this.GroupFolders(children, orphans);
    });

    return parents;
  }

  Gallery$ = this.Query$('/box/search?query=' + _SEARCH_ANY_ + 
        '&type=folder&limit=200&ancestor_folder_ids=' + _GALLERY_).pipe(
          map((result:any) => result.entries),
          map(entries => {

            let parents = _.filter(entries, e=> e.parent.id == _GALLERY_);
            let orphans = _.filter(entries, e=> e.parent.id != _GALLERY_);

            return this.GroupFolders(parents, orphans);
          }),
          shareReplay(1)
          )
  
  Root$ = this.GetFolder$('0');
  WebHooks$ = this.Query$('/box/webhooks').pipe(
    map((result: {entries, limit}) => result ? result.entries : null)
  )

  Search$(search, type: string) { 
    return this.Query$('/box/search?query=' + search + '&type=' + type +'&fields=id,type,name&content_types=name').pipe(
      tap(t => console.log("HERE", search, t))
    )
  }

  Project$(project:string) { //project name aka workspace name
    return this.Search$(project, 'folder').pipe(
      map((result:any) => result.total_count > 0 ? result.entries[0] : null),
      switchMap((folder:any) => folder && folder.id ? this.GetFolder$(folder.id) : of(null))
    )
  }
}