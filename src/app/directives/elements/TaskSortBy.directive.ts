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
              case "Name": return this.sortByName(items, reverse);
              case "Item Code": return this.sortByItemCode(items, reverse);
              case "Status": return this.sortByStatus(items, reverse);
              case "Caption" : return this.sortByCaption(items, reverse);
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
    return reverse ? [...result].reverse() : [...result];
  }

  sortByItemCode(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.itemcode && i.itemcode.text);
    let remaining = _.filter(items, (i: BoardItem) => !i.itemcode || !i.itemcode.text);

    let result = _.sortBy(items, (i:BoardItem) => i.itemcode ? i.itemcode.text : null);
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }

  sortByCaption(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.caption && i.caption.text);
    let remaining = _.filter(items, (i: BoardItem) => !i.caption || !i.caption.text);

    let result = _.sortBy(filtered, (i:BoardItem) => i.caption ? i.caption.text : null);
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }


  sortByStatus(items: BoardItem[], reverse: boolean) {
    let result = _.sortBy(items, (i:BoardItem) => i.status ? i.status.text : 'Not Started');
    return reverse ? [...result].reverse() : [...result];
  }

  sortByArtist(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.artist && i.artist.length > 0);
    let remaining = _.filter(items, (i: BoardItem) => !i.artist || i.artist.length < 1);

    let result = _.sortBy(filtered, (i:BoardItem) => i.artist ? _.map(i.artist, a => a.text).join(', ') : null);
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }

  sortByDirector(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.director && i.director.length > 0);
    let remaining = _.filter(items, (i: BoardItem) => !i.director || i.director.length < 1);

    let result = _.sortBy(filtered, (i:BoardItem) => i.director ? _.map(i.director, d => d.text).join(', ') : null);
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }

  sortByStart(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.timeline && i.timeline['value']);
    let remaining = _.filter(items, (i: BoardItem) => !i.timeline || !i.timeline['value']);

    let result = _.sortBy(filtered, (i:BoardItem) => i.timeline['value'].from );
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }

  sortByFinish(items: BoardItem[], reverse: boolean) {
    let filtered = _.filter(items, (i:BoardItem) => i.timeline && i.timeline['value']);
    let remaining = _.filter(items, (i: BoardItem) => !i.timeline || !i.timeline['value']);

    let result = _.sortBy(filtered, (i:BoardItem) => i.timeline['value'].to);
    if (reverse)
      result = result.reverse();
    result = result.concat(remaining);
    return result;
  }
}
