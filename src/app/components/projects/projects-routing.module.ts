import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
    { path: ':project/:category/:collection', component: OverviewComponent },
    { path: ':project/:category', component: OverviewComponent },
    { path: ':project', component: OverviewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }