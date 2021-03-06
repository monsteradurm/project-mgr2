import { Component, OnInit, Inject, OnDestroy, Output, ApplicationRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil, shareReplay, tap, map } from 'rxjs/operators';
import { UserIdentity } from './models/UserIdentity';
import { NavigationService } from './services/navigation.service';
import { UserService } from './services/user.service';

import '@fullcalendar/core';
import { MondayService } from './services/monday.service';
import { ChromeService } from './services/chrome.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BroadcastChannel } from 'broadcast-channel';
const TAB_MESSAGE = "project-mgr.live/another-tab";

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Project Manager';
  isIframe = false;

  private readonly _destroying$ = new Subject<void>();

  private MondayExhausted$ = this.monday.ComplexityExhausted$.pipe(
    map((message:string) => {
      if (!message)
        return;


      return message;
    })
  )

  MondayExhausted: string = null;

  private Token = new BehaviorSubject<string>(null);
  Token$ = this.Token.asObservable().pipe(shareReplay(1));

  IsChrome$ = this.chrome.IsChrome$;

  constructor(
    private chrome: ChromeService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    public navigation: NavigationService,
    private application: ApplicationRef,
    private monday: MondayService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.navigation.AppComponent = this;
  }
  isSmallScreen = this.breakpointObserver.isMatched('(max-width: 599px)');
  MarginTop: number = 71;
  DisplayNavigation:boolean = true;

  NavigationMenu$ = this.navigation.NavigationMenu$;
  IsMondayReachable: boolean = true;
  IsAuthorized: boolean = true;
  IsAdmin: boolean = false;

  @Output() User: UserIdentity = null;
  @Output() MyPhoto: any;

  BroadcastChannel = new BroadcastChannel('tab')
  private TabError = new BehaviorSubject<boolean>(false);
  TabError$ = this.TabError.asObservable().pipe(shareReplay(1));
  subscriptions = [];
  ngOnInit(): void {
    this.BroadcastChannel.postMessage(TAB_MESSAGE);
    this.BroadcastChannel.onmessage = (message) => {
      if (message == TAB_MESSAGE)
        this.TabError.next(true);
      console.log("EQUALS? ", message == TAB_MESSAGE)
    }

    this.subscriptions.push(
      this.MondayExhausted$.subscribe(e => this.MondayExhausted = e)
    )

    this.subscriptions.push(
      this.userService.User$.subscribe((user:UserIdentity) => {
        this.User = user;
      })
    );

    this.subscriptions.push(
      this.userService.MyPhoto$.subscribe((photo: any) => this.MyPhoto = photo)
    );

    this.subscriptions.push(
      this.navigation.IsMondayReachable$.subscribe((state) => this.IsMondayReachable = state)
    );

    //this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      })
  }

  setLoginDisplay() {
    this.IsAuthorized = this.authService.instance.getAllAccounts().length > 0;
    this.userService.SetAuthorized(this.IsAuthorized);
  }

  checkAndSetActiveAccount(){
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
    this.userService.GetUser();
  }

  login() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest){
        this.authService.loginPopup({...this.msalGuardConfig.authRequest} as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
          });
        } else {
          this.authService.loginPopup()
            .subscribe((response: AuthenticationResult) => {
              this.authService.instance.setActiveAccount(response.account);
            });
      }
    } else {
      if (this.msalGuardConfig.authRequest){
        this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }
    }
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());

    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
