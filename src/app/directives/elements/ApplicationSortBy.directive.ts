import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, isObservable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';
import { Application } from '../../components/people/applications/applications.component';

@Pipe({
  name: 'ApplicationSortBy$'
})

export class ApplicationSortByDirective  {
  transform(Items$: Observable<Application[]>, Status$: Observable<string>, Reverse$: (Observable<boolean>) ) {

    return combineLatest([Items$, Status$, Reverse$]).pipe(
        map(([items, status, reverse]) => {
            switch(status) {
              case "Name": return this.sortByAttribute(items, 'Name', reverse);
              case "Email": return this.sortByAttribute(items, 'Email', reverse);
              case "Submitted": return this.sortByAttribute(items, 'Submitted', reverse);
              case "Location": return this.sortByAttribute(items, 'Location', reverse);
              case "Experience": return this.sortByAttribute(items, "YearsExperience", reverse);
              case "Rating": return this.sortByAttribute(items, "Rating", reverse);
            }
            return items;
        }));
  }

  sortByAttribute(items: Application[], attr: string, reverse: boolean) {
    let result = _.sortBy(items, (i:Application) => i[attr]);
    return reverse ? [...result].reverse() : [...result];
  }


}
