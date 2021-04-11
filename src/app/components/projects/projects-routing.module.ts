import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NoConfluenceComponent } from './no-confluence/no-confluence.component';

import { OverviewComponent } from './overview/overview.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
  {
    path: 'Overview', component: OverviewComponent
  },
  {
    path: 'NoConfluence', component: NoConfluenceComponent
  }

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
