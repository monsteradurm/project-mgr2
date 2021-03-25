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

@NgModule({
  declarations: [
    ProjectComponent,
    OverviewComponent,
    
    TabUnderlineDirective,
    
    ElementComponent
  ],
  imports: [
    ActionOutletModule,
    ActionMatModule.forRoot(ICON_TYPE.Font),

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,

    CommonModule,
    ProjectsRoutingModule,
  ]
})
export class ProjectsModule { }
