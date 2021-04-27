import { NgModule } from '@angular/core';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectComponent } from './project/project.component';
import { OverviewComponent } from './overview/overview.component';

//directives
import { TabUnderlineDirective } from './../../directives/material/tab-underline.directive';
import { FilterItemsByDepartmentPipe } from './../../directives/elements/filterItemsBydepartment.directive';
import { OverviewGanttComponent } from './overview/overview-gantt/overview-gantt.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleChartsModule } from 'angular-google-charts';
import { ResizeModule } from '@thalesrc/ng-utils/resize';
import { MatBadgeOverrideDirective } from '../../directives/material/mat-badge-override.directive'

import { OverviewSubitemComponent } from './overview/overview-subitem/overview-subitem.component';
import { OverviewBoarditemComponent } from './overview/overview-boarditem/overview-boarditem.component';
import { FilterItemsByStatusPipe } from 'src/app/directives/elements/filterItemsByStatus.directive';
import { FilterItemsByArtistPipe } from 'src/app/directives/elements/filterItemsByArtist.directive';
import { FilterItemsByDirectorPipe } from 'src/app/directives/elements/filterItems.ByDirector.directive';

import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';
import { SharedModule } from './../../shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MondayService } from 'src/app/services/monday.service';
import { UserService } from 'src/app/services/user.service';
import { NoConfluenceComponent } from './no-confluence/no-confluence.component';
import { SettingsComponent } from './settings/settings.component';
import { TaskSortByDirective } from 'src/app/directives/elements/TaskSortBy.directive';
declare var google:any;

@NgModule({
  declarations: [
    ProjectComponent,
    OverviewComponent,
    OverviewGanttComponent,
    OverviewSubitemComponent,
    OverviewBoarditemComponent,
    SettingsComponent,
    
    FilterItemsByStatusPipe,
    FilterItemsByArtistPipe,
    FilterItemsByDirectorPipe,
    FilterItemsByDepartmentPipe,
    NoConfluenceComponent,
    SettingsComponent,

    TaskSortByDirective
  ],
  imports: [
    SharedModule.forRoot(),
    GoogleChartsModule,
    ProjectsRoutingModule,
  ],
  providers: [
  ]
})
export class ProjectsModule { }
