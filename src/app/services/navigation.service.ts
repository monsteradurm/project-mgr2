import { Injectable, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { shareReplay, tap, map, filter, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { CeloxisService } from './celoxis.service';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';
import { faCogs, faUsers, faThList, faCalendar} from '@fortawesome/free-solid-svg-icons';
import { faWikipediaW} from '@fortawesome/free-brands-svg-icons'
import { ActivationEnd, ActivationStart, NavigationEnd, Router } from '@angular/router';
import { Dictionary } from '../models/Dictionary';
import { MondayService } from './monday.service';
import { Location } from '@angular/common';
import { DropDownMenuGroup, NavigationMapping } from '../components/navigation/navigation-map';
import { ConfluenceService } from './confluence.service';
import { BoxService } from './box.service';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { AppComponent } from '../app.component';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private PageTitles = new BehaviorSubject<string[]>([]);
  PageTitles$ = this.PageTitles.asObservable().pipe(shareReplay(1))

  private SelectedTitle = new BehaviorSubject<string>('Home');
  SelectedTitle$ = this.SelectedTitle.asObservable().pipe(shareReplay(1))

  Projects$ = this.monday.Projects$.pipe(
    map(projects => _.filter(projects, p=> 
      p.name.indexOf('PM2') < 0 && p.name[0] != '_')),

    shareReplay(1)
  )

  System$ = this.monday.Projects$.pipe(
    map(projects => _.find(projects, p => p.name.indexOf('PM2') > -1)),
    shareReplay(1)
  )
  
  Component: NavigationComponent;
  AppComponent: AppComponent;

  NavigationMenu$ = this.monday.Pages$.pipe(
     map(pages => {
        if (!pages)
          return null;

        let map = new NavigationMapping(pages);

        map.Titles.forEach((k) => {
          let page = map.Pages[k];

          //load menu with temp "loading" placeholder
          if (page.use_menu) {
            page.menu = this.actionOutlet.createGroup().setTitle(k)
              .enableDropdown()
              .setIcon(page.icon);       
            page.menu.createButton().setTitle('Loading...');
          }

          // create button and navigate on press
          else 
            page.menu = this.actionOutlet.createButton().setTitle(k)
            .setIcon(page.icon);
              page.menu.fire$.subscribe(
                a =>  this.Navigate(page.route, {}))
        });
        return map;
     }),
     shareReplay(1)
  )


  Selected$ = combineLatest([this.NavigationMenu$, this.SelectedTitle$]).pipe(
    map(([navMap, title]) => {
      if (!navMap || !navMap.Pages || !title)
        return null;
      return navMap.Pages[title];
    }),
    shareReplay(1)
  )
  IsMondayReachable$ = this.monday.IsReachable$;
  

  private NavigationEndEvent$ = this.router.events
    .pipe(
      filter(e => (e instanceof NavigationEnd)),
      map((e:NavigationEnd) => e),
      shareReplay(1)
    );

  NavigationUrl$ = this.NavigationEndEvent$.pipe(
    map(e => e.url.split('/')[1])
  )

  NavigationParameters$ = this.NavigationEndEvent$.pipe(
    map(e => {
      let arr = e.url.split(';');
      arr.shift();

      let result = { };
      arr.forEach(param => {
        let paramArr = param.split('=');
        result[paramArr[0]] = paramArr[1].replace('%20', ' ')
      });
      return result;
  }),
  );

  PrimaryColor$ = this.Selected$.pipe(
    map(selected => selected && selected.background ? selected.background : 'gray')
  )

  SetSelected(selected:any) {
    if (!selected) return;
    if (selected.indexOf(';') > -1)
      selected = selected.split(';')[0]

    this.SelectedTitle.next(selected);
  }

  Navigate(route, params) {
    this.router.navigate([route, params]);
  }

  Relocate(route, params) {
    let url = route + ';';
    
    if (url[0] != '/')
      url = '/' + url;

    Object.keys(params).filter(p => params[p]).forEach(p => url += p + '=' + params[p] + ';')
    this.location.replaceState(url);
  }
  
  AddPageTitle(title:string) {
    let v = this.PageTitles.value;
    v.push(title);
    this.PageTitles.next(v);
  }
  PopPageTitle() {
    let v = this.PageTitles.value;
    v = v.slice(0, v.length - 1);
    this.PageTitles.next(v);
  }

  SetPageTitles(titles: string[]) {
    let v = [];
    if (titles)
      titles.forEach(t => v.push(t));
      
    this.PageTitles.next(v);
  }

  SetSystemMenu(navMenu, system) {
    if (!system || !navMenu)
          return;

    let menu = navMenu.Pages['System'].menu;
    menu.removeChildren();

    if (system.children.length < 1) 
        menu.createButton({ title: "No System Settings to Show" });

        
    system.children.forEach(s => {
        menu.createButton({ title: s.name }).fire$.subscribe((a) => {
        this.Navigate('/System', { board: s.id, name: s.name })
        })
    })
  }

  BuildGalleryDropDown(dropdown:ActionGroup, children: any[], folder:any) {
    if (!children || !children.length) {
      console.log("No Children to Expand Dropdown", dropdown)
    }
    
    children.forEach(child => {
      let nameArr = child.name.split('_');
      let name = nameArr.join(' ');
      if (child.parent.id == this.box.Gallery_ID)
        name = nameArr[nameArr.length - 1];
      
      if (child['children'] && child['children'].length > 0) {
        
        let option = dropdown.createGroup()
          .enableDropdown().setTitle(name);

        this.BuildGalleryDropDown(option, child['children'], child);

      } else {
        let entries = child.path_collection.entries;
        let index = _.findIndex(entries, e => e.id == this.box.Gallery_ID);
        let names = _.map(entries.splice(index + 1, entries.length - index), e=> e.name);
        let fullpath = names.join('/') + '/' + child.name;
        dropdown.createButton().setTitle(name)
            .fire$.subscribe(a => this.Navigate('/Gallery', 
            { folder: child.id, path: fullpath })
          );
      }
    });
  }

  BuildOverviewDropDown(dropdown:ActionGroup, children: any[], project:any) {
    if (!children || !children.length) {
      console.log("No Children to Expand Dropdown", dropdown)
    }

    children.forEach(child => {
      if (child.name[0] != '_') {

        if (child['children']) {
          let option = dropdown.createGroup()
            .enableDropdown().setTitle(child.name.replace('_', ' '));
          this.BuildOverviewDropDown(option, child['children'], project);
        } else {

          dropdown.createButton().setTitle(child.name.replace('_', ' '))
            .fire$.subscribe(a => this.Navigate('/Projects/Overview', { board: child.id })
          );

        }
      }

    })
  }


  
  OnConfluence(p: string) {
    let key = p;
    if (p.indexOf('_') > 0)
      key = p.split('_')[0];

    this.confluence.SpaceOverview$(key).pipe(take(1)).subscribe(space => {
      if (!space)
        this.Navigate('/Projects/NoConfluence', {project: p});
      else 
        window.open('https://liquidanimation.atlassian.net/wiki/spaces/' + key + '/overview', "_blank");
    })
  }

  GetReferenceFolder(project) :Observable<string> {
    if (!project || !project.children || project.children.length < 1)
      return of(null);

    let settings = _.find(project.children, c => c.name == '_Settings');

    if (!settings)
      return of(null);

    return this.monday.ProjectSettings$(settings.id).pipe(
      map(
        settings => {
          if (!settings || !settings['Box Folders'])
            return null;

          let ref =  _.find(settings['Box Folders'], s => s.name == 'Reference');

          if (!ref || !ref.column_values || ref.column_values.length < 1) return null;
          return ref.column_values[0].text;
        }
      )
    )
  }

  SetGalleryMenu(navMenu, gallery) {
    if (!navMenu || !gallery) 
      return;

    let page = navMenu.Pages['Gallery'];

    let menu = page.menu;
    menu.removeChildren();
    if (gallery.length < 1) {
      menu.createButton({ title: "No Galleries to Show" });
    }

    this.BuildGalleryDropDown(page.menu, gallery, null);

  }
  SetProjectsMenu(navMenu, projects) {
    if (!navMenu || !projects)
      return;

    let page = navMenu.Pages['Projects'];

    let menu = page.menu;
    menu.removeChildren();
    if (projects.length < 1) {
      menu.createButton({ title: "No Projects to Show" });
    }

    projects.forEach(p => {
      let group = menu.createGroup()
        .enableDropdown().setTitle(p.name.replace('_', ' '));

      let groupA = group.createGroup().createGroup()
        .enableDropdown().setTitle('Overview');

      if (p.children)
        this.BuildOverviewDropDown(groupA, p['children'], p);
      else  {
        group.createButton({title: 'No Boards to Show'});
        return;
      }

      
      let groupB = group.createGroup();
      groupB.createButton().setTitle('Confluence').fire$.subscribe(a => {
        this.OnConfluence(p.name)
      });

      groupB.createButton().setTitle('Reference').fire$.subscribe(a => {
        this.ReferenceFolder$ = this.GetReferenceFolder(p);
        this.showReferenceDlg.next(true);
      });

      let groupC = group.createGroup();
      groupC.createButton().setTitle('Settings').fire$.subscribe(a => {
        this.Navigate('/Projects/Settings', { workspace: p.id, project: p.name })
      });
    })
  }

  private showReferenceDlg = new BehaviorSubject<boolean>(false);
  ShowReferenceDlg$ = this.showReferenceDlg.asObservable().pipe(shareReplay(1));

  ReferenceFolder$;
  constructor( 
    private location:Location,
    private confluence: ConfluenceService,
    private actionOutlet: ActionOutletFactory,
    private monday: MondayService, 
    private box: BoxService,
    private router: Router) {
    this.NavigationUrl$
      .subscribe( parent => {
        if (!parent || parent.trim().length < 1)
          this.SetSelected("Home");
        this.SetSelected(parent)
      });

    combineLatest([this.NavigationMenu$, this.Projects$]).subscribe(
      ([navMenu, projects]) => this.SetProjectsMenu(navMenu, projects))


    combineLatest([this.NavigationMenu$, this.System$]).subscribe(
      ([navMenu, sys]) => this.SetSystemMenu(navMenu, sys))

    combineLatest([this.NavigationMenu$, this.box.Gallery$]).subscribe(
      ([navMenu, gallery]) => this.SetGalleryMenu(navMenu, gallery))
  }
}
