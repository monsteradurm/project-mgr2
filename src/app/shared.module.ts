import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionOutletModule } from '@ng-action-outlet/core';
import { ActionMatModule, ICON_TYPE } from '@ng-action-outlet/material';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

//directives
import { TabUnderlineDirective } from './directives/material/tab-underline.directive';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ResizeModule } from '@thalesrc/ng-utils/resize';
import { MatBadgeOverrideDirective } from './directives/material/mat-badge-override.directive'

import { FocusInputDirective } from 'src/app/directives/material/focusInput.directive';
import { ViewTaskDlgComponent } from './components/dialog/view-task-dlg/view-task-dlg.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';

import { ConfirmDlgComponent } from './components/dialog/confirm-dlg/confirm-dlg.component';
import { LogHoursDlgComponent } from './components/dialog/log-hours-dlg/log-hours-dlg.component';
import { TaskTooltipComponent } from './components/tooltips/task/task.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { FindSyncItemPipe } from './directives/elements/FindSyncItem.directive';
import { FindBoardItemByIdPipe } from './directives/elements/FindBoardItemById.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { MatchSubItemsWithBoardItemPipe } from './directives/elements/MatchSubItemsWithBoardItem.directive';
import { FindUserFromNamePipe } from './directives/elements/FindUserFromName.drective';
import { FindUserPhotoFromIdentityPipe } from './directives/elements/FindUserPhotoFromEmail.directive';
import { FetchUpdatesToSyncItemPipe } from './directives/elements/FetchUpdatesToSyncItem.directive';
import { TrustResourceURLPipe } from './directives/elements/TrustResourceURL.directive';
import { MatDividerModule } from '@angular/material/divider';
import { BoxService } from './services/box.service';
import { ConfluenceService } from './services/confluence.service';
import { SwappingSquaresSpinnerModule, ScalingSquaresSpinnerModule, FlowerSpinnerModule } from 'angular-epic-spinners'
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LazyImageComponent } from './components/UI/lazy-image/lazy-image.component';
import { ReferenceDlgComponent } from './components/dialog/reference-dlg/reference.-dlgcomponent';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NavBtnDirective } from './directives/material/navbtn.directive';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MondayBoolIsCheckedPipe } from './directives/monday/mondayBool-isChecked.directive';
import { ReferenceComponent } from './components/reference/reference.component';
import { MouseWheelDirective } from './directives/mousewheel.directive';
import { SplitterModule } from 'primeng/splitter';
import { FetchSubItemsFromBoardItemPipe } from './directives/elements/FetchSubItemsFromBoardItem.directive';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { EitherOrValueDirective } from './directives/elements/EitherOrValue.directive';
import { GroupbyPipe } from './directives/elements/GroupBy.directive';
import { ParseJSONPipe } from './directives/elements/ParseJSON.directive';
import { TimelinePipe } from './directives/elements/timeline.directive';
import { StringSplitPipe } from './directives/StringSplit.directive';
import { GetLastSubItemByBoardItemPipe } from './directives/elements/GetLastSubItemByBoardItem.directive';
import { FindSyncReviewPipe } from './directives/elements/FindSyncReview.directive';
import { SyncUpdateComponent } from './components/syncsketch/sync-update/sync-update.component';
import { SyncItemComponent } from './components/syncsketch/sync-item/sync-item.component';
import { MaxCharactersPipe } from './directives/maxCharacters.directive';
import { FilterMilestonesPipe } from './directives/elements/FilterMilestones.directive'
import { TimeEntryComponent } from './components/dialog/log-hours-dlg/time-entry/time-entry.component';
import { pmCalendarDirective } from './directives/material/pmcalendar.directive';
import { FindUserFromMondayIdentityPipe } from './directives/elements/FindUserFromMondayIdentity.directive';
import { UserCanEditPipe } from './directives/elements/UserCanEdit.directive';
import { FindByIdPipe } from './directives/FindById.directive';
import { LogComponent } from './components/tooltips/log/log.component';
import { ArtistComponent } from './components/tooltips/artist/artist.component';
import { AllocationComponent } from './components/tooltips/allocation/allocation.component';
import { FilterLogsByDatePipe } from './directives/elements/FilterLogByDate.directive';
import { SupportService } from './services/support.service';
import { SupportComponent } from './components/support/support.component';
import { SupportItemComponent } from './components/support/support-item/support-item.component';
import { PreventContextDirective } from './directives/preventContext.directive';
import { LayoutModule } from '@angular/cdk/layout';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { FirebaseService } from './services/firebase.service';
import { FilterCompletePipe } from './directives/elements/FilterCompleted.directive';
import { GetBoxFolderInformationPipe } from './directives/box/GetBoxFolderInformation';
import { FlattenDepartmentsPipe } from './directives/elements/FlattenDepartments.directive';
import { BarRatingModule } from "ngx-bar-rating";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FindUserByIdPipe } from './directives/elements/FndUserById.directive';

declare var google: any;

const declarations = [
  NavigationComponent,
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
  NavBtnDirective,
  GetTaskStatusDirective,
  FilterSyncReviewsByItemPipe,
  FindSyncItemPipe,
  FindBoardItemByIdPipe,
  MatchSubItemsWithBoardItemPipe,
  FindUserFromNamePipe,
  FindUserPhotoFromIdentityPipe,
  FetchUpdatesToSyncItemPipe,
  TrustResourceURLPipe,
  LazyImageComponent,
  ReferenceDlgComponent,
  ReferenceComponent,
  MondayBoolIsCheckedPipe,
  MouseWheelDirective,
  FetchSubItemsFromBoardItemPipe,
  EitherOrValueDirective,
  GroupbyPipe,
  ParseJSONPipe,
  TimelinePipe,
  StringSplitPipe,
  GetLastSubItemByBoardItemPipe,
  FindSyncReviewPipe,
  SyncItemComponent,
  SyncUpdateComponent,
  MaxCharactersPipe,
  FilterMilestonesPipe,
  LogHoursDlgComponent,
  TimeEntryComponent,
  pmCalendarDirective,
  FindUserFromMondayIdentityPipe,
  UserCanEditPipe,
  FindByIdPipe,
  LogComponent,
  ArtistComponent,
  AllocationComponent,
  FilterLogsByDatePipe,
  SupportComponent,
  SupportItemComponent,
  PreventContextDirective,
  AddTippyDirective,
  FilterCompletePipe,
  GetBoxFolderInformationPipe,
  FlattenDepartmentsPipe,
  FindUserByIdPipe
]

const imports = [
  CommonModule,
  HttpClientModule,

  BarRatingModule,
  AngularEditorModule,
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
  MatSidenavModule,
  LayoutModule,

  //prime
  ScrollPanelModule,
  DialogModule,
  SkeletonModule,
  ColorPickerModule,
  SplitterModule,
  ToastModule,
  BadgeModule,
  FileUploadModule,
  ResizeModule,

  SwappingSquaresSpinnerModule,
  ScalingSquaresSpinnerModule,
  FlowerSpinnerModule,

  LazyLoadImageModule,

  //firebase
  AngularFireModule.initializeApp(environment.firebase),

  //ng-action-outlet
  ActionOutletModule,
  ActionMatModule.forRoot(ICON_TYPE.Font),


]

let exports = [...declarations, ...imports];

const providers = [
  { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: false } },
  UserService,
  MondayService,
  NavigationService,
  SyncSketchService,
  BoxService,
  ConfluenceService,
  MessageService,
  SupportService,
  FirebaseService
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
      providers: providers,
    };
  }
}
