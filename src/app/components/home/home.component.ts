import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';

import * as _ from 'underscore';

const _SCHEDULE_COLUMNS_ = ['Artist', 'Directpr', 'Timeline', 'Time Tracking']
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;

  startDate = new BehaviorSubject<moment.Moment>(moment().startOf('week'));
  StartDate$ = this.startDate.asObservable().pipe(shareReplay(1));

  endDate = new BehaviorSubject<moment.Moment>(moment().endOf('week'));
  EndDate$ = this.endDate.asObservable().pipe(shareReplay(1));

  Dates$ = combineLatest([this.StartDate$, this.EndDate$]).pipe(
    map(([start, end]) => {
      let result = [];
      let day = moment(start);
      while (day <= end) {
        result.push(day.format('YYYY-MM-DD'));
        day = day.clone().add(1, 'd');
      }
      return result;
    })).pipe(shareReplay(1));


  constructor(private authService: MsalService, 
    private DomSanitizer: DomSanitizer,
    private app: AppComponent,
    private monday: MondayService,
    private UserService : UserService,
    private msalBroadcastService: MsalBroadcastService,
    private navigationService: NavigationService) { }
    
  Me$ = combineLatest([this.UserService.User$, this.monday.MondayUsers$]).pipe(
    map(([me, users]) => _.find(users, u => u.email == me.mail)),
    shareReplay(1)
  )


  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));

  OutlookCalendar$ = of([]);
  Boards$ = this.monday.Boards$;

  MyAllocations$ = combineLatest([this.Boards$, this.Columns$]).pipe(
    switchMap(([boards, c_ids]) => {
      let b_ids = _.map(boards, b => b.id);
      return this.monday.ColumnValuesFromBoards$(b_ids, c_ids);
    }),
    map((items:any) => )
  )

  ngOnInit(): void {
   
    this.MyAllocations$.subscribe(console.log);
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        if (result?.payload?.account) {
          this.authService.instance.setActiveAccount(result.payload.account);
        }
      });
    
    this.setLoginDisplay();
    
  }
  
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

}