import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BoardItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';

@Pipe({
  name: 'Badges$'
})

export class BadgesDirective  {
    constructor(public firebase: FirebaseService) { }

  transform(boarditem$: Observable<BoardItem | ScheduledItem>) {
   if (!boarditem$) return of(null);

   return boarditem$.pipe(
       switchMap(boarditem => this.firebase.BadgesEarned$(boarditem).pipe(
        map(values => values && values.badges?  values.badges : []),
      ))
   )
  }
}
