import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ItemStatus } from 'src/app/models/Calendar';

@Pipe({
  name: 'GetTaskStatus'
})

export class GetTaskStatusDirective  {
  transform(status: any) {
    let result = new ItemStatus();

    if (!status || !status.additional_info)
        return result;

    result.text = status.text;
    result.color = status.additional_info.color;

    return result;
  }
}
