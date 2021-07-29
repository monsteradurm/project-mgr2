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
    take(1)
  )

  RetrieveFile$(form_id, response_id, answer) {
    let fileArr = answer.file_url.split('/');
    let file = fileArr[fileArr.length - 1];

    return this.Download$('typeform/forms/' + form_id + '/responses/' +
      response_id + '/fields/' + answer.field.id + '/files/' + file);
  }

  RemoveResponse$(form_id, response_id) {
    return this.Delete$('/typeform/forms/' + form_id + '/responses?included_response_ids=' + response_id)
  }

  Webhooks$(id: string) {
    return this.Query$('/typeform/forms/' + id + '/webhooks')
  }

  Delete$(address) {
    return this.http.delete(address, httpOptions).pipe(
      take(1)
    )
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
    return this.Query$('/typeform/forms/' + id + '/responses?page_size=1000').pipe(
      take(1)
    )
  }
}
