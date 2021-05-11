import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, take } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayService } from 'src/app/services/monday.service';
import { MondayIdentity } from 'src/app/models/Monday';

@Pipe({
  name: 'FindUserFromMondayId$'
})

export class FindUserFromMondayIdentityPipe  {
    constructor(private userService: UserService, private monday:MondayService){}
  transform(id: string)  : Observable<UserIdentity>{

    return this.monday.MondayUsers$.pipe(
        map(users => _.find(users, (u:MondayIdentity) => u.id.toString() == id)),
        switchMap(user => 
            this.userService.AllUsers$.pipe(
                map((users:UserIdentity[]) => _.find(users, u => user.name == u.givenName + ' ' + u.surname))
            )
        )
    )
  }
}
