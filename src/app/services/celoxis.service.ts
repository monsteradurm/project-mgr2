import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { switchMap, tap, shareReplay, catchError, map } from 'rxjs/operators';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'underscore';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': "Bearer " + environment.celoxis.token
  })
};

@Injectable({
  providedIn: 'root'
})
export class CeloxisService {

  constructor(private http: HttpClient) { }

  IsReachable = new BehaviorSubject<boolean>(true);
  IsReachable$ = this.IsReachable.asObservable().pipe(shareReplay(1));

  Projects$ = this.QueryArray$(`projects?filter=${encodeURIComponent(
    JSON.stringify(
      {state: 'Active'}
    )
  )}`)

  MinProjects$ = this.Projects$.pipe(
    map((projects: any[]) => _.map(projects, p => ({
      name: p.name,
      categories: p.custom_categories.trim().split(',')
    })))
  )

  SetReachable(state: boolean) {
    this.IsReachable.next(state);
  }

  QueryArray$(addr: string, page=1) {
    return this.http.get(
      `${environment.celoxis.url}${addr}${page == 1 ? '' : '&page=' + page}`, httpOptions).pipe(
      catchError((err:HttpErrorResponse) => {
        if (err.message.indexOf("Unknown") >= 0)
          this.IsReachable.next(false);
        return of({data: [], totalRecords: 0, error: true});
      }),
      tap((result: CeloxisQueryResult) => {
        if (!result.error && !this.IsReachable.value)
          this.SetReachable(true);
      }),
      map((result: CeloxisQueryResult) => result.data)
    );
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

}

class CeloxisQueryResult {
  data: any[];
  error: string = null;
  totalRecords: number;
}
