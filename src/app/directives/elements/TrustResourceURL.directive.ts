import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'TrustResourceURL'
})

export class TrustResourceURLPipe  {
    constructor(private sanitizer: DomSanitizer) { }
  transform(url: string) {
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      url //.replace("https://item-data-cdn.syncsketch.com/", "/item-data-cdn-syncsketch-com/")
          //.replace("https://media-cdn.syncsketch.com/", "media-cdn-cdn-syncksetch-com")
      );
  }
}
