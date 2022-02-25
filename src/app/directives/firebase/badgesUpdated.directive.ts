import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';

@Pipe({
  name: 'BadgeUpdated$'
})

export class BadgesUpdatedDirective  {
    constructor(public firebase: FirebaseService) { }

  transform(board$: Observable<string>) {
    if (!board$) return of(null);
   
   return board$.pipe(
      switchMap(board => this.firebase.BadgesUpdated$(board))
   );
  }
}
