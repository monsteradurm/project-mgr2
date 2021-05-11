import { NgModule } from '@angular/core';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectComponent } from './project/project.component';
import { OverviewComponent } from './overview/overview.component';

//directives
import { FilterItemsByDepartmentPipe } from './../../directives/elements/filterItemsBydepartment.directive';
import { OverviewGanttComponent } from './overview/overview-gantt/overview-gantt.component';
import { GoogleChartsModule } from 'angular-google-charts';

import { OverviewSubitemComponent } from './overview/overview-subitem/overview-subitem.component';
import { OverviewBoarditemComponent } from './overview/overview-boarditem/overview-boarditem.component';
import { FilterItemsByStatusPipe } from 'src/app/directives/elements/filterItemsByStatus.directive';
import { FilterItemsByArtistPipe } from 'src/app/directives/elements/filterItemsByArtist.directive';
import { FilterItemsByDirectorPipe } from 'src/app/directives/elements/filterItems.ByDirector.directive';

import { SharedModule } from './../../shared.module';
import { NoConfluenceComponent } from './no-confluence/no-confluence.component';
import { SettingsComponent } from './settings/settings.component';
import { TaskSortByDirective } from 'src/app/directives/elements/TaskSortBy.directive';
import { FilterItemsByNameDirective } from '../../directives/elements/FilterItemsByName.directive';
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

    TaskSortByDirective,
    FilterItemsByNameDirective
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
