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

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  PageTitles = new BehaviorSubject<string[]>([]);
  PageTitles$ = this.PageTitles.asObservable().pipe(shareReplay(1));

  Selected = new BehaviorSubject<any>(NavigationMap.Home);
  Selected$ = this.Selected.asObservable().pipe(shareReplay(1))

  MinProjects$ = this.celoxis.MinProjects$;
  IsCeloxisReachable$ = this.celoxis.IsReachable$;

  SetSelected(selected:any) {
    this.Selected.next(NavigationMap[selected]);
  }

  Navigate(route, params) {
    this.router.navigate([route, params]);
  }

  SetPageTitles(titles: string[]) {
    this.PageTitles.next(titles);
  }

  constructor(private celoxis: CeloxisService, private router: Router) {
    this.router.events
      .pipe(
        filter(e => (e instanceof NavigationEnd)),
        map((e:NavigationEnd) => e.url.split('/')[1])
      )
      .subscribe(parent => {
        this.SetSelected(parent)
      });
  }
}
