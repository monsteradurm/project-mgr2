import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';

@Pipe({
  name: 'FindUserPhotoFromIdentity$'
})

export class FindUserPhotoFromIdentityPipe  {
    constructor(private userService: UserService){}
  transform(User: UserIdentity)  : Observable<UserIdentity>{

    return this.userService.UserPhoto$(User.id);
  }
}
