import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectComponent } from '../project/project.component';
import { combineLatest } from 'rxjs';
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

  CollectionMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('list').setTitle('SomeCollection');

  HasCollections$ = this.parent.HasCollections$;

  ngOnDestroy() : void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest([this.parent.Collection$, this.parent.CollectionNames$]).pipe(
        ).subscribe(([selected, cols]) => {
          this.CollectionMenu.setTitle(selected.name);
          this.CollectionMenu.removeChildren();
          cols.forEach(c =>
            this.subscriptions.push(
              this.CollectionMenu.createButton({title: c}).fire$.subscribe(a => this.parent.SetCollection(c))
            )
        );
      })
    );
  }

}
