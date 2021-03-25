import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { NavigationMap } from './navigation-map';
import {BehaviorSubject} from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { shareReplay, map } from 'rxjs/operators';
import * as _ from 'underscore';
import { CeloxisService } from 'src/app/services/celoxis.service';
import { AppComponent } from './../../app.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationService } from 'src/app/services/navigation.service';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @Input() IsCeloxisReachable: boolean = true;
  @Input() IsAuthorized: boolean = false;
  @Input() User: any;
  @Input() MyPhoto: any;

  NavigationMap = NavigationMap;
  PageTitles$ = this.navigation.PageTitles$;
  
  constructor(
    private actionOutlet: ActionOutletFactory,
    private navigation: NavigationService) { 
      const buttons = Object.keys(this.NavigationMap);

      buttons.forEach((k) => {
        if (NavigationMap[k].use_menu) {
          this.NavigationMap[k].menu = this.actionOutlet.createGroup()
            .enableDropdown()
            .setIcon(NavigationMap[k].icon);       
            this.NavigationMap[k].menu.createButton().setTitle('Loading...');
        }
        else {
          this.NavigationMap[k].menu = this.actionOutlet.createButton()
          .setIcon(NavigationMap[k].icon);
          this.subscriptions.push(
            this.NavigationMap[k].menu.fire$.subscribe(
              a => this.OnButtonAction(k))
          )
        }

        //this.NavigationMap[k].menu.createButton().setTitle("NYI");
      });
    }


  OnButtonAction(ev) {
    this.navigation.Navigate('/' + ev, {})
    this.navigation.SetPageTitles([]);
  }

  OnProjectOverview(p, b) {
    this.navigation.Navigate('/Projects/Overview', { board: b.id });
  }

  Selected$ = this.navigation.Selected$;
  subscriptions = [];
  
  BuildOverviewDropDown(dropdown:ActionGroup, children: any[], project:any) {
    if (!children || !children.length) {
      console.log("No Children to Expand Dropdown", dropdown)
    }
    children.forEach(child => {
      if (child['children']) {
        let option = dropdown.createGroup()
          .enableDropdown().setTitle(child.name);
        this.BuildOverviewDropDown(option, child['children'], project);
      } else {
        dropdown.createButton().setTitle(child.name)
          .fire$.subscribe(a => {
            this.OnProjectOverview(project, child);
          });
      }
    })
  }
  ngOnInit(): void {
    this.subscriptions.push(
      this.navigation.Projects$.subscribe((projects: any[]) => 
      {
        let menu = this.NavigationMap.Projects.menu
        menu.removeChildren();
        if (projects.length < 1) {
          menu.createButton({ title: "No Projects to Show" });
        }
        projects.forEach(p => {
          let group = menu.createGroup()
            .enableDropdown().setTitle(p.name);
          group = group.createGroup()
            .enableDropdown().setTitle('Overview');
          if (p.children)
            this.BuildOverviewDropDown(group, p['children'], p);
          else 
            group.createButton({title: 'No Boards to Show'});
        })
        
        /*
        projects.forEach(p => {

          let g = menu.createGroup().enableDropdown().setTitle(p.name);

          p.categories.forEach(c => { 
            let btn = g.createButton({title: c})
            this.subscriptions.push(
              btn.fire$.subscribe(a => 
                this.OnProjectCategory(p.name, c))
            )
          });
        })
        */
    }));
      
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  callback({ action }: ActionButtonEvent) {
    console.log('Clicked:', action.getTitle() || action.getIcon());
  }
}
