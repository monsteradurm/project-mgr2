import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';

@Pipe({
  name: 'FetchSubItemsFromBoardItem$'
})

export class FetchSubItemsFromBoardItemPipe  {
    constructor(private monday: MondayService) { }
  transform(Item$: Observable<BoardItem>) {
    
    if (!Item$) return of(null);

    return Item$.pipe(
        switchMap(item => {
            if (!item || !item.subitem_ids || item.subitem_ids.length < 1)
                return of([]);

            return this.monday.SubItems$(item.subitem_ids)
        }),
        map(subitems => _.map(subitems.reverse(), s=> new SubItem(s))),
        shareReplay(1),
    )
  }
}
