import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'timeline'
})

export class TimelinePipe  {
    constructor() { }
  transform(timeline: string) {
      if (!timeline) return;

      let arr = timeline.split(' - ');
      let start = moment(arr[0]);
      let end = moment(arr[1]);

      return start.format('MMM DD') + ' - ' + end.format('MMM DD YYYY')
  }
}
