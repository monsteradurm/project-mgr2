import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { combineLatest, of } from 'rxjs';
import { catchError, filter, map, shareReplay, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;

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

  OutlookCalendar$ = of([]);
  Boards$ = this.monday.Boards$;

  MyAllocations$ = combineLatest([this.Me$, this.Boards$]).pipe(
    map(([me, boards]) => {
      
      return []
    })
  )

  ngOnInit(): void {
   
    this.MyAllocations$.subscribe(console.log);
    this.navigationService.SetPageTitles(["LAS0002 VRProject", "Characters"]);

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