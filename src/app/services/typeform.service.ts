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

  RetrieveFile$(form_id, response_id, answer) {
    let fileArr = answer.file_url.split('/');
    let file = fileArr[fileArr.length - 1];

    return this.Download$('typeform/forms/' + form_id + '/responses/' + 
      response_id + '/fields/' + answer.field.id + '/files/' + file);

  }
  //forms/o8Hxpg5C/responses/31a30adlgisqog2kd31a3mb7xmhd1q0t/fields/WQDqhUVR3yqK/files/ac54e2b09337-Asset_Flow_Diagram.pdf
  //forms/o8Hxpg5C/responses/31a30adlgisqog2kd31a3mb7xmhd1q0t/fields/WQDqhUVR3yqK/files/ac54e2b09337-Asset_Flow_Diagram.pdf"
  Webhooks$(id: string) {
    return this.Query$('/typeform/forms/' + id + '/webhooks')
  }

  Query$(address) {
    return this.http.get(address, httpOptions).pipe(
      take(1)
    )
  }
  Download$(address) {
    return this.http.get<Blob>(address, {
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer HvEbs4iKz83jcpTLNcFbMc3S6FtpkEXBoKNmRQaDXzeE`,
      }),
      observe: 'body', responseType: 'blob' as 'json'
    }).pipe(
      map((data:Blob) => {
        var url = window.URL.createObjectURL(data);
        window.open(url, '_blank', ''); 
      }),
      take(1)
    )
  }
  Form$(id: string) {
    return this.Query$('/typeform/forms/' + id + '/responses').pipe(
      take(1)
    )
  }
}
