import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';

@Pipe({
  name: 'FindUserFromName$'
})

export class FindUserFromNamePipe  {
    constructor(private userService: UserService){}
  transform(Name: string)  : Observable<UserIdentity>{

    return this.userService.AllUsers$.pipe(
        map((users:UserIdentity[]) => _.find(users, u => Name == u.givenName + ' ' + u.surname))
    )
  }
}
