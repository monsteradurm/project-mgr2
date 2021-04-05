import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

//Components
import { NavigationComponent } from './components/navigation/navigation.component';

//Services
import { CeloxisService } from './services/celoxis.service';
import { MondayService } from './services/monday.service';
import { NavigationService} from './services/navigation.service';
import { UserService } from './services/user.service';

//msal-angular
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';
import { OAuthSettings } from './../environments/oath';

//material design
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker/';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter'
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';

//font-awesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//ng-action-outlet
import { ActionOutletModule } from '@ng-action-outlet/core';
import { ActionMatModule, ICON_TYPE } from '@ng-action-outlet/material';

//fullcalendar
import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin

//primeng
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {DialogModule} from 'primeng/dialog';

//routing
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/UI/user/user.component';
import { PersonComponent } from './components/people/person/person.component';
import { PeopleComponent } from './components/people/people.component';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { SystemComponent } from './components/system/system.component'
import { GoogleChartsModule } from 'angular-google-charts';
import { MatBadgeModule } from '@angular/material/badge';
import { FocusInputDirective } from './directives/material/focusInput.directive';
import { TabUnderlineDirective } from './directives/material/tab-underline.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TaskTooltipComponent } from './components/tooltips/task/task.component';
import { StyleOverrideDirective } from './directives/material/styleoverride.directive';
import { AddTippyDirective } from './directives/addTippy.directive';
import { LogHoursDlgComponent } from './components/dialog/log-hours-dlg/log-hours-dlg.component';
import { ViewTaskDlgComponent } from './components/dialog/view-task-dlg/view-task-dlg.component';
import { ConfirmDlgComponent } from './components/dialog/confirm-dlg/confirm-dlg.component';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin
]);

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: OAuthSettings.appId,
      redirectUri: '/',
      postLogoutRedirectUri: '/'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', OAuthSettings.consentScopes);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: OAuthSettings.consentScopes,
    },
    loginFailedRoute: '/login-failed'
  };
}


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    UserComponent,
    PersonComponent,
    PeopleComponent,
    SchedulingComponent,
    SystemComponent,

    TabUnderlineDirective,
    AddTippyDirective,
    StyleOverrideDirective,
    FocusInputDirective,
    TaskTooltipComponent,
    LogHoursDlgComponent,
    ViewTaskDlgComponent,
    ConfirmDlgComponent

  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,

    //material design
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTableModule,
    MatTabsModule,
    FlexLayoutModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMomentDateModule,
    MatSelectModule,
    MatCheckboxModule,
     
    //font-awesome
    FontAwesomeModule,

    HttpClientModule,
    MsalModule,

    //prime
    ScrollPanelModule,
    DialogModule,

    //calendar
    FullCalendarModule,

    //ng-action-outlet
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font)
  ],

  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: false}},
    //msal-angular
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,

    //services
    CeloxisService,
    NavigationService,
    MondayService,
    UserService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
