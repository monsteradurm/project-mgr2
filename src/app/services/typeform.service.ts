import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': `Bearer HvEbs4iKz83jcpTLNcFbMc3S6FtpkEXBoKNmRQaDXzeE`
  })
};

const LiquidWorkspace = "fzi2MS";

@Injectable({
  providedIn: 'root'
})
export class TypeformService {

  constructor(public firebase: FirebaseService, private http: HttpClient) { }

  Forms$ = this.Query$('/typeform/forms?workspace_id=' + LiquidWorkspace).pipe(
    map((response:any) => response.items),
    tap(t => console.log("FORMS", t)),
    take(1)
  )

  Webhooks$(id: string) {
    return this.Query$('/typeform/forms/' + id + '/webhooks')
  }

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
