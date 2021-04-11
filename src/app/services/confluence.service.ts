import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'underscore';
import { UserService } from './user.service';

const _USER_ = btoa(environment.confluence.user + ':' + environment.confluence.token)
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'X-Atlassian-Token': 'no-check',
    'Authorization': `Basic ${_USER_}`
  })
};

const AdminOptions = {
  headers: new HttpHeaders({
    'Accept':  'application/json',
    'Authorization': `Bearer ${environment.confluence.admin.key}`
  })
}
@Injectable({
  providedIn: 'root'
})
export class ConfluenceService {

  constructor(private http: HttpClient, private userService: UserService) {
   }

   Users$ = this.QueryArray$('/group/confluence-users/member').pipe(
    map(users => _.filter(users, u => u.accountType == 'atlassian'))
   );

   Content$(key: string) {
     return this.Query$('/space/' + key + '/content')
   }

   Space$(key:string) : Observable<any> {
     return this.Query$('/space/' + key);
   }

   SpaceOverview$(key) :Observable<any> {
     return this.Spaces$.pipe(
       map(spaces => _.find(spaces, s=> _.find(spaces, s=> s.key == key))),
       catchError(err => of(null))
     )
   }

   UserEmails$ = this.http.get('/atlassian/group/confluence-users/member', httpOptions)
   
   Spaces$ = this.QueryArray$('/space');

   Query$(addr: string) {
    if (addr[0] != '/')
      addr = '/' + addr;
    return this.http.get('/confluence' + addr, httpOptions)
    .pipe(take(1))
   }

   QueryArray$(addr: string) {
    return this.Query$(addr).pipe(
      tap(console.log),
      map((response:any) => response.results)
    )
   }
}
