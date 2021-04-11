import { Injectable } from '@angular/core';
//import * as box from 'box-javascript-sdk';
declare var BoxSdk: any;
@Injectable({
  providedIn: 'root'
})
export class BoxService {

  constructor(HttpR) { 
  
  }
  /*
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(httpRequest);
  }*.
}
