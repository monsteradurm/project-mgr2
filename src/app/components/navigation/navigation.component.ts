import { Component, OnInit, OnDestroy, ViewChild, Input, OnChanges, ViewChildren, QueryList, Output, Inject, AfterViewInit, HostBinding, HostListener } from '@angular/core';
import { NavigationMapping } from './navigation-map';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { shareReplay, map, take, tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { AppComponent } from './../../app.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationService } from 'src/app/services/navigation.service';
import { ActionOutletFactory, ActionButtonEvent, ActionGroup, ActionButton, ActionOutletDirective } from '@ng-action-outlet/core';
import 'tippy.js';
import tippy from 'tippy.js';
import { ConfluenceService } from 'src/app/services/confluence.service';
import { MondayService } from 'src/app/services/monday.service';

const _IGNORE_ = '/Box';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    evt.preventDefault();
  }

  @HostBinding('style.display') DisplayNavigation = 'block';

  @ViewChildren(ActionOutletDirective) Groups : QueryList<ActionOutletDirective>
  @Input() IsCeloxisReachable: boolean = true;
  @Input() IsAuthorized: boolean = false;
  @Input() User: any;
  @Input() MyPhoto: any;
  @Input() NavigationMenu: NavigationMapping;

  ShowReference:boolean = false;
  ReferenceFolder$ = this.navigation.ReferenceFolder$;
  constructor(
    private navigation: NavigationService) {
    this.navigation.Component = this;
  }

  PageTitles$ = this.navigation.PageTitles$;
  Selected$ = this.navigation.Selected$;
  subscriptions = [];

  NavSelected(s) {
    if (!this.Groups)
      return;

    console.log("HERE", s);
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
      this.navigation.ShowReferenceDlg$.subscribe(state => {
        this.ReferenceFolder$ = this.navigation.ReferenceFolder$;
        this.ShowReference = state;
      })
    )
    this.subscriptions.push(
      this.Selected$.subscribe((s) => {
        this.NavSelected(s);
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  callback({ action }: ActionButtonEvent) {
    console.log('Clicked:', action.getTitle() || action.getIcon());
  }
}
