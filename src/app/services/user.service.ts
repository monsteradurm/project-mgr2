import { ApplicationRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, combineLatest, EMPTY, empty, forkJoin, from, Observable, of } from 'rxjs';
import { tap, shareReplay, take, switchMap, catchError, map, expand, reduce, retryWhen, delay, retry, flatMap, mergeMap } from 'rxjs/operators';
import { UserIdentity } from '../models/UserIdentity';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalService } from '@azure/msal-angular';
import { OAuthSettings } from 'src/environments/oath';
import { AuthenticationResult } from '@azure/msal-common';

import * as _ from 'underscore';
import { MondayIdentity } from '../models/Monday';
import { MondayService } from './monday.service';

const PMUser = '327c95ba-6ff0-47f3-9c7b-e9b2b296f60d';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  UserPhotos = {};

  private IsAuthorized = new BehaviorSubject<boolean>(true);
  IsAuthorized$ = this.IsAuthorized.asObservable();

  private IsAdmin = new BehaviorSubject<boolean>(false);
  IsAdmin$ = this.IsAdmin.asObservable();

  private User = new BehaviorSubject<UserIdentity>(null);
  User$ = this.User.asObservable();

  MondayUsers$ = this.monday.MondayUsers$.pipe(shareReplay(1));

  MondayUser$ = this.User$.pipe(
    switchMap(user => this.MondayUsers$.pipe(
      map(users => _.find(users, (u: MondayIdentity) => u.email.split('@')[0] == user.mail.toLowerCase().split('@')[0])),
      catchError(err => EMPTY),
      shareReplay(1)
    )) 
  )

  UserIsManager$ = this.MondayUser$.pipe(
    map(user => user && user.teams && user.teams.indexOf('Managers') > -1),
    shareReplay(1)
  )

  GetUserPhoto$(id) {
    return 
  }

  MyPhoto$ = this.User$.pipe(
    switchMap((user) => {
      if (!user) return of(null);

      if (this.UserPhotos[user.id]) return this.UserPhotos[user.id];

      this.UserPhotos[user.id] = 
        this.http.get<Blob>(
          `https://graph.microsoft.com/v1.0/me/photos/48x48/$value`, { observe: 'body', responseType: 'blob' as 'json' }
        ).pipe(
          map(blob => {
            if (blob === null) return null;
            var binaryData = [];
            binaryData.push(blob);
      
            return this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(new Blob(binaryData, { type: "image/jpg" }))
            );
          }),
          shareReplay(1)
        );
        return this.UserPhotos[user.id];
    }),
  )


  UserPhoto$(id) {
    if (!id) return of(null);

    if (this.UserPhotos[id]) return this.UserPhotos[id];

    this.UserPhotos[id] = this.Token$.pipe(
      switchMap(auth =>
        this.http.get<Blob>(

          `https://graph.microsoft.com/v1.0/users/${id}/photo/$value`, {
          headers: new HttpHeaders({
            'Authorization': `${auth.tokenType} ${auth.accessToken}`
          }),
          observe: 'body', responseType: 'blob' as 'json'
        }).pipe(catchError(err => of(null)))

      )
    ).pipe(
      map(blob => {
        if (blob === null) return null;
        var binaryData = [];
        binaryData.push(blob);

        return this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(new Blob(binaryData, { type: "image/jpg" }))
        );
      }),
      catchError(err => {
        return of(null);
      }),
      shareReplay(1)
    )

    return this.UserPhotos[id];
  }

  constructor(private http: HttpClient, 
    private monday: MondayService,
    private sanitizer: DomSanitizer,
    private app: ApplicationRef,
    private auth: MsalService) {
  }

  ReceivedError: boolean = false;
  GetUser() {
    let errorCount = 0;
    this.http.get(
      'https://graph.microsoft.com/v1.0/me'
    )
      .pipe(
        retryWhen(errors => {
          return errors.pipe(
            mergeMap((error: any) => {
              if (errorCount++ < 5) {
                console.log("Caught MS Graph error --> Retrying")
                return of(error.status).pipe(delay(1000));
              }
              return Observable.throw(error);
            })
          )
        }),
        take(1),
      ).subscribe((user) => {
        this.SetUser(user);
      })
  }

  checkAndSetActiveAccount() {
    let activeAccount = this.auth.instance.getActiveAccount();
    if (!activeAccount && this.auth.instance.getAllAccounts().length > 0) {
      let accounts = this.auth.instance.getAllAccounts();
      this.auth.instance.setActiveAccount(accounts[0]);
    }
  }

  get Token$(): Observable<AuthenticationResult> {
    //this.checkAndSetActiveAccount();
    let errorCount = 0;
  
    return of(null
    ).pipe(
      switchMap((r:AuthenticationResult) =>  this.auth.acquireTokenSilent(
        { scopes: OAuthSettings.consentScopes }
      )),
      retryWhen(errors => {
        return errors.pipe(
          mergeMap((error: any) => {
            this.checkAndSetActiveAccount();
            if (errorCount++ < 5) {
              console.log("Caught MS Graph error --> Retrying")
              return of(error.status).pipe(delay(1000));
            }
            return Observable.throw(error);
          })
        )
      }),
    )
  }


  AllUsers$ = combineLatest([this.User$, this.Token$]).pipe(
    switchMap(([user, auth]) => {
      let headers = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `${auth.tokenType} ${auth.accessToken}`
        })
      }
      return this.http.get('https://graph.microsoft.com/v1.0/users?', headers)
        .pipe(
          expand((data, i) => data['@odata.nextLink'] ? this.http.get(data['@odata.nextLink'], headers) : empty()),
          reduce((acc, data) => {
            return acc.concat(data['value']);
          }, []),
          map(users => _.filter(users, u => u.givenName && u.surname && u.mail)),
          map(users => _.filter(users,
            u => u.mail.indexOf('liquidanimation.com') > 0)),
          map(users => {
            _.forEach(users, u => u.mail = u.mail.toLowerCase());
            return users;
          })
        )
    }),
    shareReplay(1)
  )

  SetUser(user) {
    let u = this.User.value;
    if (user != u) {
      console.log("SETTING USER", user)
      this.User.next(user);
      //window.location.reload()
    }
  }

  SetAuthorized(state: boolean) {
    this.IsAuthorized.next(state);
    if (this.IsAuthorized)
      this.GetUser();
    else this.SetUser(null);
  }

}
