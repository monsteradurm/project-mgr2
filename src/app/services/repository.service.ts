import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import * as _ from 'underscore';

const LAREPOSYNC_UPDATES = "lareposync/lareposync-updates?comp=list"
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};


@Injectable({
  providedIn: 'root'
})
export class RepositoryService {


  constructor(private http: HttpClient) { 

  }

  parseXml(xml) {
    var dom = null;
    try { 
      dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
    } 
    catch (e) { dom = null; }

    return dom;
 }

 xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = this.xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(this.xmlToJson(item));
			}
		}
	}
	return obj;
};

  LastUpdate$ = this.http.get(LAREPOSYNC_UPDATES, { responseType: 'text' }).pipe(
    map(res => this.parseXml(res)),
    map(xml => this.xmlToJson(xml)),
    map((data:any) => data.EnumerationResults.Blobs.Blob ? data.EnumerationResults.Blobs.Blob : null),
    map((blobs: any[]) => _.sortBy(blobs, b=> b.LastModified).reverse()[0]),
    map((blob:any) => blob.Url['#text']),
    take(1));
  
}
