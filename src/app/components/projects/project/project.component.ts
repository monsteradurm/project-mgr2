import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized, ActivationEnd } from '@angular/router';
import { filter, map, switchMap, shareReplay, take } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

import { NavigationService } from 'src/app/services/navigation.service';
import { CeloxisService } from '../../../services/celoxis.service';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy
 {

  constructor(private navigation: NavigationService,
              private celoxis: CeloxisService) { }

  Project$ = this.navigation.NavigationParameters$.pipe(
    switchMap(params => {
      if (!params['project'])
        return of([]);

      return this.celoxis.GetProjectByName$(params['project'])
    }),
    map((filtered:any[]) => filtered && filtered.length > 0 ? filtered[0] : null),
    shareReplay(1),
  )

  Category$ = combineLatest([this.Project$, this.navigation.NavigationParameters$]).pipe(
     switchMap( ([project, params]) => {
       if (!project || !project.id || !params['category'])
          return of([]);

       return this.celoxis.GetCategory$(project.id, params['category'])
     }),
     map((filtered:any[]) => filtered && filtered.length > 0 ? filtered[0] : null),
     shareReplay(1),
  )

  Collections$ = combineLatest([this.Project$, this.Category$]).pipe(
    switchMap( ([project, category]) => {
      if (!project || !project.id || !category || !category.id)
         return of(null);

      return this.celoxis.GetCollections$(project.id, category.id);
    }),
    map(collections => _.sortBy(collections, 'name')),
    shareReplay(1)
  );

  CollectionNames$ = this.Collections$.pipe(
    map(collections => collections && collections.length > 0?
        _.map(collections, c => c.name) : []),
  );

  HasCollections$ = this.CollectionNames$.pipe(
    map((names: string[]) => names && names.length > 0 ? true : false)
  )

  Collection$ = combineLatest([this.Project$, this.Category$, this.CollectionNames$,
      this.navigation.NavigationParameters$]).pipe(
    switchMap(([project, category, collectionNames, params]) => {

      if (!project || !project.id || !category || !category.id)
         return of(null);

      else if (!collectionNames || collectionNames.length < 1 || !params)
        return of(null);


      let col = params['collection'];
      if (!col)
        col = collectionNames[0];

      return this.celoxis.GetCollection$(project.id, category.id, col);
    }),
    map((filtered:any[]) => filtered && filtered.length > 0 ? filtered[0] : null),
    shareReplay(1)
  )

  Departments$ = this.Category$.pipe(
    map(cat => cat && cat.custom_Departments ? cat.custom_Departments.trim().split(',') : [])
  )

  Department$ = combineLatest([this.Departments$, this.navigation.NavigationParameters$]).pipe(
    map(([departments, params]) => {
      let dep = params['department'];
      if (dep != undefined && dep != null)
        return dep;

      if (departments)
        return departments[0];
    })
  )

  SetCollection(c) {
    combineLatest([this.Project$, this.Category$, this.Department$]).pipe(take(1)).subscribe(
      ([proj, cat, dep]) => {

        this.navigation.Navigate('/Projects/Overview', {
          project: proj.name, category: cat.name, collection: c, department: dep})
      }
    )
  }

  //Elements$ = combineLatest([this.Project$, this.Category$, this.Collection$])
  subscriptions = [];
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
