import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, of } from 'rxjs';
import { tap, shareReplay, take, switchMap, catchError, map } from 'rxjs/operators';
import { UserIdentity } from '../models/UserIdentity';
import { DomSanitizer } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  IsAuthorized = new BehaviorSubject<boolean>(true);
  IsAuthorized$ = this.IsAuthorized.asObservable().pipe(shareReplay(1));

  IsAdmin = new BehaviorSubject<boolean>(false);
  IsAdmin$ = this.IsAdmin.asObservable().pipe(shareReplay(1));

  User = new BehaviorSubject<UserIdentity>(null);
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

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  
  GetUser() {
    this.http.get(
    'https://graph.microsoft.com/v1.0/me'
    ).pipe(
      take(1)
    ).subscribe((user) => this.SetUser(user))
  }

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
