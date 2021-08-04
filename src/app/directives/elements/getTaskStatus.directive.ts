import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ItemStatus } from 'src/app/models/Calendar';
import { ScheduledItem } from 'src/app/models/Monday';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'GetTaskStatus$'
})

export class GetTaskStatusDirective  {
  transform(item$: Observable<BoardItem | ScheduledItem>) {

    if (!item$) return of(new ItemStatus());

    return item$.pipe(
      map((item: BoardItem | ScheduledItem) => {
        if (!item.status) return new ItemStatus();
        return item.status;
      }),
      map((status: any) => {
        let result = new ItemStatus();
        if (!status || !status.additional_info)
          return result;

        result.text = status.text;
        result.color = status.additional_info.color;
        return result;
      }),
    )
  }
}
