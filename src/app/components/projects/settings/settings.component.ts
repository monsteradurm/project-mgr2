import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ProjectComponent } from '../project/project.component';
import * as _ from 'underscore'
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  Fetching:boolean = true;
  InvalidWorkspaceId: boolean = false;

  private _workspaceId = new BehaviorSubject<string>(null);
  WorkSpaceId = this._workspaceId.asObservable();
  private _workspaceName = new BehaviorSubject<string>(null);

  constructor(private parent: ProjectComponent) { }

  get primaryColor() { 
    return this.parent.PrimaryColor;
  }

  subscriptions = [];
  
  Settings$ = combineLatest([this.parent.monday.Boards$, this.WorkSpaceId]).pipe(
    tap(t => this.Fetching = true),
    map(([boards, wspace]) => {
      if (!boards || !wspace) return [];
      return _.find(boards, b=> b.name == '_Settings' && 
          b.workspace.id.toString() == wspace)
    }),
    switchMap(board => board ? this.parent.monday.ProjectSettings$(board.id) : of(null)),
    tap(t => this.Fetching = false),
    shareReplay(1)
  )

  Settings;
  Groups: string[];

  ngOnInit(): void {
    this.subscriptions.push(
      this.parent.NavigationParameters$.subscribe(params => {
        if (!params || !params.workspace || !params.project){
          this.InvalidWorkspaceId = true;
          return;
        }
        this._workspaceName.next(params.project);
        this._workspaceId.next(params.workspace);

        this.parent.navigation.SetPageTitles([params.project, 'Settings'])
      })
    );

    this.subscriptions.push(
      this.Settings$.subscribe(settings => {
        this.Settings = settings;
        if (settings) {
          this.Groups = Object.keys(settings);
        }
      })
    )
  }

}
