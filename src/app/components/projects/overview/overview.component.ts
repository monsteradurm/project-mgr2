import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectComponent } from '../project/project.component';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ActionOutletFactory, ActionButtonEvent, ActionGroup } from '@ng-action-outlet/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  subscriptions = [];
  constructor(public parent: ProjectComponent, private actionOutlet: ActionOutletFactory) {

  }

  private groupMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('list');


  BoardItems$ = this.parent.BoardItems$;
  Board$ = this.parent.Board$.pipe(tap(console.log))
  Group$ = this.parent.Group$;

  GroupsMenu$ = combineLatest([this.Board$, this.Group$]).pipe(
    map(([board, group]) => {
      if (!board || !group || !group.title)
        return null;
      this.groupMenu.setTitle(group.title);
      this.groupMenu.removeChildren();
      board.groups.forEach(g => this.groupMenu.createButton()
      .setTitle(g.title).fire$.subscribe(a => this.SetGroup(g.id)));
      return this.groupMenu;
    }),
  )

  SetGroup(g) {
    this.parent.SetGroup(g);
  }
  
  
  get primaryColor() { return this.parent.PrimaryColor; }


  ngOnDestroy() : void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  //SetDepartment(d) { this.parent.SetDepartment(d); }

  ngOnInit(): void {
   
  }

}
