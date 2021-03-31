import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'FilterItemsByArtist$'
})

export class FilterItemsByArtistPipe  {
  transform(items$: Observable<any[]>, people$: Observable<string[]>) {

    return combineLatest([items$, people$]).pipe(
      map(([items, people]) => {

        if (!people || people.length < 1) return items;

        let filtered = _.filter(items, i => { 

            if (!i.artist || i.artist.length < 1)
                return true;

            let selected = _.filter(i.artist, a=> people.indexOf(a.text) > -1);
            if (selected.length < i.artist.length)
                return true;
            return false;
        });

        return [...filtered];
      })
    )
  }
}
