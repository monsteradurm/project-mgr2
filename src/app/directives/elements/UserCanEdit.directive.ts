import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { UserService } from 'src/app/services/user.service';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayIdentity } from 'src/app/models/Monday';

@Pipe({
    name: 'UserCanEdit$'
})

export class UserCanEditPipe {
    constructor(private userService: UserService) { }
    transform(id: string | number, user: MondayIdentity) {
        if (!user)

            return this.userService.MondayUser$.pipe(
                map((me) => this.Query_CanEdit(id, me))
            )

        return of(this.Query_CanEdit(id, user));
    }

    Query_CanEdit(id: string | number, user: MondayIdentity) {
        if (user.teams.indexOf('Managers') > -1)
            return true;
        else if (user.id.toString() == id.toString())
            return true;
    }
}
