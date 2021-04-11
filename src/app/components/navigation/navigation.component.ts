import { Component, OnInit, OnDestroy, ViewChild, Input, OnChanges, ViewChildren, QueryList } from '@angular/core';
import { NavigationMap } from './navigation-map';
import {BehaviorSubject} from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { shareReplay, map, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { AppComponent } from './../../app.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationService } from 'src/app/services/navigation.service';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup, ActionButton, ActionOutletDirective } from '@ng-action-outlet/core';
import 'tippy.js';
import tippy from 'tippy.js';
import { ConfluenceService } from 'src/app/services/confluence.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @ViewChildren(ActionOutletDirective) Groups : QueryList<ActionOutletDirective>
  @Input() IsCeloxisReachable: boolean = true;
  @Input() IsAuthorized: boolean = false;
  @Input() User: any;
  @Input() MyPhoto: any;

  NavigationMap = NavigationMap;
  PageTitles$ = this.navigation.PageTitles$;
  
  constructor(
    private actionOutlet: ActionOutletFactory,
    private confluence: ConfluenceService,
    private navigation: NavigationService) { 
      const buttons = Object.keys(this.NavigationMap);

      buttons.forEach((k) => {
        if (NavigationMap[k].use_menu) {
          this.NavigationMap[k].menu = this.actionOutlet.createGroup().setTitle(k)
            .enableDropdown()
            .setIcon(NavigationMap[k].icon);       
            this.NavigationMap[k].menu.createButton().setTitle('Loading...');
        }
        else {
          this.NavigationMap[k].menu = this.actionOutlet.createButton().setTitle(k)
          .setIcon(NavigationMap[k].icon);
          this.subscriptions.push(
            this.NavigationMap[k].menu.fire$.subscribe(
              a => this.OnButtonAction(k))
          )
        }
      });
    }


  OnButtonAction(ev) {
    this.navigation.Navigate('/' + ev, {})
    this.navigation.SetPageTitles([]);
  }

  OnProjectOverview(p, b) {
    this.navigation.Navigate('/Projects/Overview', { board: b.id });
  }

  OnConfluence(p: string) {
    let key = p;
    if (p.indexOf('_') > 0)
      key = p.split('_')[0];

    this.confluence.SpaceOverview$(key).pipe(take(1)).subscribe(space => {
      if (!space)
        this.navigation.Navigate('/Projects/NoConfluence', {project: p});
      else 
        window.open('https://liquidanimation.atlassian.net/wiki/spaces/' + key + '/overview', "_blank");
    })
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
          .enableDropdown().setTitle(child.name.replace('_', ' '));
        this.BuildOverviewDropDown(option, child['children'], project);
      } else {
        dropdown.createButton().setTitle(child.name.replace('_', ' '))
          .fire$.subscribe(a => {
            this.OnProjectOverview(project, child);
          });
      }
    })
  }

  NavSelected(s) {
    if (!this.Groups)
      return;

    for(let g = 0; g < this.Groups.length; g++) {
      let group = this.Groups.get(g);
      if (group.actionOutlet.getTitle() == s.title) {
        group.actionOutlet.setAriaLabel(s.title + "Active");
      } else {
        group.actionOutlet.setAriaLabel(null)
      }
    }

  }
  ngOnInit(): void {
    this.subscriptions.push(
      this.Selected$.subscribe((s) => this.NavSelected(s))
    )

    this.subscriptions.push(
      this.navigation.Projects$.subscribe((projects: any[]) => 
      {
        let menu = this.NavigationMap.Projects.menu;
        menu.removeChildren();
        if (projects.length < 1) {
          menu.createButton({ title: "No Projects to Show" });
        }
        projects.forEach(p => {
          let group = menu.createGroup()
            .enableDropdown().setTitle(p.name.replace('_', ' '));
          group.createButton().setTitle('Confluence').fire$.subscribe(a => {
            this.OnConfluence(p.name)
          });

          group = group.createGroup()
            .enableDropdown().setTitle('Overview');
          if (p.children)
            this.BuildOverviewDropDown(group, p['children'], p);
          else 
            group.createButton({title: 'No Boards to Show'});
        })
        
       
    }));
      
  }


  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  callback({ action }: ActionButtonEvent) {
    console.log('Clicked:', action.getTitle() || action.getIcon());
  }
}
