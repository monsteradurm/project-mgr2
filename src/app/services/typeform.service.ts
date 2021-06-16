import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': `Bearer HvEbs4iKz83jcpTLNcFbMc3S6FtpkEXBoKNmRQaDXzeE`
  })
};


@Injectable({
  providedIn: 'root'
})
export class TypeformService {

  constructor(public firebase: FirebaseService, private http: HttpClient) { }

  Forms$ = this.firebase.TypeForms$;

  Query$(address) {
    return this.http.get(address, httpOptions).pipe(
      take(1)
    )
  }
  Form$(id: string) {
    return this.Query$('/typeform/forms/' + id + '/responses').pipe(
      take(1)
    )
  }
}
