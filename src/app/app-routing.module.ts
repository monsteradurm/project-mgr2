import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MsalGuard } from '@azure/msal-angular';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { PeopleComponent } from './components/people/people.component';
import { SystemComponent } from './components/system/system.component';
import { ProjectComponent } from './components/projects/project/project.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { SupportComponent } from './components/support/support.component';
import { BoxWebhooksComponent } from './components/system/box-webhooks/box-webhooks.component';
import { ApplicationsComponent } from './components/people/applications/applications.component';
import { RepositoriesComponent } from './components/repositories/repositories.component';

const routes: Routes = [
  {
    path: 'Projects',
    component: ProjectComponent,
    loadChildren: () => import('./components/projects/projects.module').then(m => m.ProjectsModule),
  },
  {
    path: 'Home',
    component: HomeComponent,
  },
  {
    path: 'Applications',
    component: ApplicationsComponent
  },
  {
    path: 'code',
    component: HomeComponent,
  },
  {
    path: '',
    component: HomeComponent
  },
    {
      path: 'Repositories',
      component: RepositoriesComponent
    },
  {
    path: 'Support',
    component: SupportComponent
  },
  {
    path: 'Scheduling',
    component: SchedulingComponent
  },
  {
    path: 'People',
    component: PeopleComponent
  },
  {
    path: 'System',
    component: SystemComponent,
    children: [
      {
        path: 'BoxWebhooks',
        component: BoxWebhooksComponent
      }
    ]
  },
  {
    path: 'Gallery',
    component: GalleryComponent
  },
/*  {
    path: 'login-failed',
    component: FailedComponent
  }  */
];

const isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    // Don't perform initial navigation in iframes
    initialNavigation: !isIframe ? 'enabled' : 'disabled' // Remove this line to use Angular Universal
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
