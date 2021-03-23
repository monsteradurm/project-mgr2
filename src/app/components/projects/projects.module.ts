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

@NgModule({
  declarations: [
    ProjectComponent,
    OverviewComponent
  ],
  imports: [
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font),

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,

    CommonModule,
    ProjectsRoutingModule,
  ]
})
export class ProjectsModule { }
