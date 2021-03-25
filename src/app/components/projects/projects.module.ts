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

//directives
import { TabUnderlineDirective } from './../../directives/material/tab-underline.directive';
import { ElementComponent } from './overview/element/element.component';
import { FilterItemsByDepartmentPipe } from './../../directives/elements/filterItemsBydepartment.directive';
import { OverviewGanttComponent } from './overview/overview-gantt/overview-gantt.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    ProjectComponent,
    OverviewComponent,

    TabUnderlineDirective,
    FilterItemsByDepartmentPipe,
    ElementComponent,
    OverviewGanttComponent
  ],
  imports: [
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font),

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,

    FlexLayoutModule,
    CommonModule,
    ProjectsRoutingModule,
  ]
})
export class ProjectsModule { }
