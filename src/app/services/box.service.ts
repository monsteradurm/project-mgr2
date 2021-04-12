import { EventEmitter, Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler, HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, retry, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import * as _ from 'underscore';

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


  private refreshToken = new BehaviorSubject<boolean>(true);
  RefreshToken$ = this.refreshToken.asObservable();

  constructor(private http: HttpClient) { 
    this.Projects$.subscribe(t => console.log("Token", t))
  }

  GetFolder$(id: string) {
    return this.Query$('/box/folders/' + id);
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

  Headers$ = this.Token$.pipe(
    map(token =>  ({
        headers: new HttpHeaders(
          { 'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + token}
        )
      }), 
    ),
  )

  Query$(addr: string) {
    return this.Headers$.pipe(
      switchMap(headers => this.http.get(addr, headers)),
      take(1), 
    )
  }

  Root$ = this.GetFolder$('0');

  Reference$ = this.GetFolder$('135358271773');

  Projects$ = this.Reference$.pipe(
    map(folder => folder['item_collection'].entries),
    catchError(err => {
      console.log(err);
      return of([]) 
    })
  )

  Project$(project:string) { //project name aka workspace name
    return this.Projects$.pipe(
      map((projects:any) => _.find(projects, p => p.name == project))
    )
  }
}