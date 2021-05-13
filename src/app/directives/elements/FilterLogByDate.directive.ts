import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import * as moment from 'moment';
import { TimeEntry } from 'src/app/models/TimeLog';

@Pipe({
  name: 'FilterLogsByDate'
})

export class FilterLogsByDatePipe  {
  transform(logs: TimeEntry[], date: moment.Moment) {

    return _.filter(logs, (l:TimeEntry) => moment(l.date).isSame(date, 'day'));
  }
}
