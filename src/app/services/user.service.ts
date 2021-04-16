import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, empty, from, Observable, of } from 'rxjs';
import { tap, shareReplay, take, switchMap, catchError, map, expand, reduce, retryWhen, delay, retry } from 'rxjs/operators';
import { UserIdentity } from '../models/UserIdentity';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalService } from '@azure/msal-angular';
import { OAuthSettings } from 'src/environments/oath';
import { AuthenticationResult } from '@azure/msal-common';

import * as _ from 'underscore';
import { MondayIdentity } from '../models/Monday';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private IsAuthorized = new BehaviorSubject<boolean>(true);
  IsAuthorized$ = this.IsAuthorized.asObservable().pipe(shareReplay(1));

  private IsAdmin = new BehaviorSubject<boolean>(false);
  IsAdmin$ = this.IsAdmin.asObservable().pipe(shareReplay(1));

  private User = new BehaviorSubject<UserIdentity>(null);
  User$ = this.User.asObservable().pipe(shareReplay(1));

  MyPhoto$ = this.User$.pipe(
    switchMap((user) => 
      user ? 
      this.http.get<Blob>(
        `https://graph.microsoft.com/v1.0/me/photos/48x48/$value`, { observe: 'body', responseType: 'blob' as 'json' }
      ) : of(null)
    ),
    map(blob => {
      if (blob === null) return null;
      var binaryData = [];
      binaryData.push(blob);
     
      return this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(new Blob(binaryData, {type: "image/jpg"}))
      );
    }),
  )


  UserPhoto$(id) {
    return this.Token$.pipe(

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
        window.URL.createObjectURL(new Blob(binaryData, {type: "image/jpg"}))
      );
      }),
      catchError(err => {
        return of(null);
      })
    ).pipe(take(1))
  }

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private auth: MsalService) { 
  }

  
  GetUser() {
    this.http.get(
    'https://graph.microsoft.com/v1.0/me'
    )
      .pipe(
        retryWhen(errors => {
          console.log("Caught MS Graph error --> Retrying")
          return errors.pipe(delay(1000), take(2))
        }),
      take(1)
    ).subscribe((user) => this.SetUser(user))
  }

  checkAndSetActiveAccount(){
    let activeAccount = this.auth.instance.getActiveAccount();
    if (!activeAccount && this.auth.instance.getAllAccounts().length > 0) {
      let accounts = this.auth.instance.getAllAccounts();
      this.auth.instance.setActiveAccount(accounts[0]);
    }
  }


  get Token$(): Observable<AuthenticationResult> {
    this.checkAndSetActiveAccount();
    return this.auth.acquireTokenSilent(
      { scopes: OAuthSettings.consentScopes }
      )
  }


  AllUsers$ = this.Token$.pipe(
      switchMap(auth => {
        let headers = { 
          headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': `${auth.tokenType} ${auth.accessToken}`
          })
        }
        return this.http.get('https://graph.microsoft.com/v1.0/users?', headers)
          .pipe(
          expand((data, i) => data['@odata.nextLink'] ? this.http.get(data['@odata.nextLink'], headers) : empty()),      
          reduce((acc, data) => {
                return acc.concat(data['value']);
              }, []),
          map(users => _.filter(users, u => u.givenName && u.surname && u.mail )),
          map(users => _.filter(users, 
              u => u.mail.indexOf('liquidanimation.com') > 0)),
        )
      })
  ).pipe(
    retryWhen(errors => {
      console.log("Caught MS Graph error --> Retrying")
      return errors.pipe(delay(1000), take(2))
    }),
    shareReplay(1)
  )
  
  SetUser(user) {
    this.User.next(user);
  }

  SetAuthorized(state:boolean) {
    this.IsAuthorized.next(state);
    if (this.IsAuthorized) 
      this.GetUser();
    else this.SetUser(null);
  }

}
