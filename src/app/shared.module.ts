import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionOutletModule } from '@ng-action-outlet/core';
import { ActionMatModule, ICON_TYPE } from '@ng-action-outlet/material';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import {MatBadgeModule} from '@angular/material/badge';

//directives
import { TabUnderlineDirective } from './directives/material/tab-underline.directive';

import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleChartsModule } from 'angular-google-charts';
import { ResizeModule } from '@thalesrc/ng-utils/resize';
import { MatBadgeOverrideDirective } from './directives/material/mat-badge-override.directive'

import { FocusInputDirective } from 'src/app/directives/material/focusInput.directive';
import { ViewTaskDlgComponent } from './components/dialog/view-task-dlg/view-task-dlg.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';

import { FullCalendarModule } from '@fullcalendar/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDlgComponent } from './components/dialog/confirm-dlg/confirm-dlg.component';
import { LogHoursDlgComponent } from './components/dialog/log-hours-dlg/log-hours-dlg.component';
import { TaskTooltipComponent } from './components/tooltips/task/task.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AddTippyDirective } from './directives/addTippy.directive';
import { MondayService } from './services/monday.service';
import { UserService } from './services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { UserComponent } from './components/UI/user/user.component';
import { NavigationService } from './services/navigation.service';
import { ArrayToStrDirective } from './directives/arrayToString.directive';
import { GetTaskStatusDirective } from './directives/elements/getTaskStatus.directive';
import { SyncSketchService } from './services/sync-sketch.service';
import { FilterSyncReviewsByItemPipe } from './directives/elements/FilterSyncReviewsByItem.drective';
import { FilterSyncItemsByTaskPipe } from './directives/elements/filterSyncItemsByTask.directive';
import { FindBoardItemByIdPipe } from './directives/elements/FindBoardItemById.directive';
import {SkeletonModule} from 'primeng/skeleton';
import { FetchSubItemsFromBoardItemPipe } from './directives/elements/FetchSubItemsFromBoardItem.directive';
import { FindUserFromNamePipe } from './directives/elements/FindUserFromName.drective';
import { FindUserPhotoFromIdentityPipe } from './directives/elements/FindUserPhotoFromEmail.directive';
import { FetchUpdatesToSyncItemPipe } from './directives/elements/FetchUpdatesToSyncItem.directive';
import { TrustResourceURLPipe } from './directives/elements/TrustResourceURL.directive';
import {MatDividerModule} from '@angular/material/divider';
import { BoxService } from './services/box.service';
import { ConfluenceService } from './services/confluence.service';
import {SwappingSquaresSpinnerModule, ScalingSquaresSpinnerModule} from 'angular-epic-spinners'
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LazyImageComponent } from './components/UI/lazy-image/lazy-image.component';
declare var google:any;

const declarations = [
    TaskTooltipComponent,
    LogHoursDlgComponent,
    ViewTaskDlgComponent,
    ConfirmDlgComponent,
    AddTippyDirective,
    MatBadgeOverrideDirective,
    TabUnderlineDirective,
    UserComponent,
    FocusInputDirective,
    ArrayToStrDirective,
    GetTaskStatusDirective,
    FilterSyncReviewsByItemPipe,
    FilterSyncItemsByTaskPipe,
    FindBoardItemByIdPipe,
    FetchSubItemsFromBoardItemPipe,
    FindUserFromNamePipe,
    FindUserPhotoFromIdentityPipe,
    FetchUpdatesToSyncItemPipe,
    TrustResourceURLPipe,
    LazyImageComponent
  ]
  
const imports = [
    CommonModule,
    HttpClientModule,

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
    MatToolbarModule,
    FormsModule,
    MatDividerModule,

    //prime
    ScrollPanelModule,
    DialogModule,
    SkeletonModule,

    ResizeModule, 
    FullCalendarModule,

    SwappingSquaresSpinnerModule,
    ScalingSquaresSpinnerModule,
    
    LazyLoadImageModule,
    
    //ng-action-outlet
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font)
]

let exports = [...declarations, ...imports];

const providers = [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: false}},
    UserService,
    MondayService,
    NavigationService,
    SyncSketchService,
    BoxService,
    ConfluenceService
];

@NgModule({
  declarations: declarations,
  imports: imports,
  providers: providers,
  exports: [imports, declarations],
})
export class SharedModule { 
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
          ngModule: SharedModule,
          providers:  providers,
        };
      }
}
