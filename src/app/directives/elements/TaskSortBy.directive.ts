import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, isObservable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'TaskSortBy$'
})

export class TaskSortByDirective  {
  transform(Items$: Observable<BoardItem[]>, Status$: Observable<string>, Reverse$: (Observable<boolean>) ) {

    return combineLatest([Items$, Status$, Reverse$]).pipe(
        map(([items, status, reverse]) => {
            switch(status) {
              case "Index": return reverse ? items : items.reverse();
              case "Name": return this.sortByName(items, reverse);
              case "Item Code": return this.sortByItemCode(items, reverse);
              case "Status": return this.sortByStatus(items, reverse);
              case "Artist": return this.sortByArtist(items, reverse);
              case "Director": return this.sortByDirector(items, reverse);
              case "Start": return this.sortByStart(items, reverse);
              case "Finish": return this.sortByFinish(items, reverse);
            }
            return items;
        }));
  }

  sortByName(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.name);
    return reverse ? result.reverse() : result;
  }

  sortByItemCode(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.itemcode ? i.itemcode.text : null);
    return reverse ? result.reverse() : result;
  }

  sortByStatus(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.status ? i.status.text : 'Not Started');
    return reverse ? result.reverse() : result;
  }

  sortByArtist(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.artist ? _.map(i.artist, a => a.text).join(', ') : null);
    return reverse ? result.reverse() : result;
  }

  sortByDirector(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.director ? _.map(i.director, d => d.text).join(', ') : null);
    return reverse ? result.reverse() : result;
  }

  sortByStart(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => {
      if (!i.timeline || !i.timeline['value'] || !i.timeline['value'].from)
        return null
      return i.timeline['value'].from
    });
    return reverse ? result.reverse() : result;
  }

  sortByFinish(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => {
      if (!i.timeline || !i.timeline['value'] || !i.timeline['value'].from)
        return null
      return i.timeline['value'].to
    });
    return reverse ? result.reverse() : result;
  }
}
