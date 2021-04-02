import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectComponent } from './project/project.component';
import { OverviewComponent } from './overview/overview.component';

import { ActionOutletModule } from '@ng-action-outlet/core';
import { ActionMatModule, ICON_TYPE } from '@ng-action-outlet/material';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import {MatBadgeModule} from '@angular/material/badge';

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
import { FocusInputDirective } from 'src/app/directives/material/focusInput.directive';
declare var google:any;

@NgModule({
  declarations: [
    ProjectComponent,
    OverviewComponent,
    
    MatBadgeOverrideDirective,
    FilterItemsByStatusPipe,
    FilterItemsByDepartmentPipe,
    FilterItemsByArtistPipe,
    FilterItemsByDirectorPipe,

    OverviewGanttComponent,
    OverviewSubitemComponent,
    OverviewBoarditemComponent
  ],
  imports: [
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font),

    GoogleChartsModule,

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatBadgeModule,
    FlexLayoutModule,
    
    ResizeModule, 
    CommonModule,

    ProjectsRoutingModule,
  ],
})
export class ProjectsModule { }
