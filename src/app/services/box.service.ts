import { Injectable } from '@angular/core';
//import * as box from 'box-javascript-sdk';
declare var BoxSdk: any;
@Injectable({
  providedIn: 'root'
})
export class BoxService {

  constructor() { 
    var box = new BoxSdk();
    console.log(box);
    var client = new box.BasicBoxClient({accessToken: "1234554321"});
  }
}
