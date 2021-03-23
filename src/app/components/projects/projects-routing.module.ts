import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
  {
    path: 'Overview', component: OverviewComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
