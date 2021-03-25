import { Injectable, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, tap, map, filter } from 'rxjs/operators';
import { NavigationMap } from '../components/navigation/navigation-map';
import * as _ from 'underscore';
import { CeloxisService } from './celoxis.service';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';
import { faCogs, faUsers, faThList, faCalendar} from '@fortawesome/free-solid-svg-icons';
import { faWikipediaW} from '@fortawesome/free-brands-svg-icons'
import { ActivationEnd, ActivationStart, NavigationEnd, Router } from '@angular/router';
import { Dictionary } from '../models/Dictionary';
import { MondayService } from './monday.service';
import { Location } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  
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




  private PageTitles = new BehaviorSubject<string[]>([]);
  PageTitles$ = this.PageTitles.asObservable().pipe(shareReplay(1));

  private Selected = new BehaviorSubject<any>(NavigationMap.Home);
  Selected$ = this.Selected.asObservable().pipe(shareReplay(1))

  Projects$ = this.monday.Projects$;
  //MinProjects$ = this.celoxis.MinProjects$;
  //IsCeloxisReachable$ = this.celoxis.IsReachable$;
  
  IsMondayReachable$ = this.monday.IsReachable$;

  PrimaryColor$ = this.Selected$.pipe(
    map(selected => selected.background)
  )

  SetSelected(selected:any) {
    if (!selected) return;
    this.Selected.next(NavigationMap[selected]);
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
  
  SetPageTitles(titles: string[]) {
    this.PageTitles.next(titles);
  }

  constructor(private celoxis: CeloxisService, 
    private location:Location,
    private monday: MondayService, 
    private router: Router) {
    this.NavigationUrl$
      .subscribe( parent => {

        if (!parent || parent.length < 1)
          this.SetSelected("Home");
        this.SetSelected(parent)

      });
  }
}
