import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionOutletFactory } from '@ng-action-outlet/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';
import { Issue } from 'src/app/models/Issues';
import { NavigationService } from 'src/app/services/navigation.service';
import { SupportService } from 'src/app/services/support.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {

  constructor(public supportService: SupportService,
    public actionOutlet: ActionOutletFactory,
    public navigation: NavigationService,
  ) {
  }

  primaryColor;

  WebServiceOptions$ = this.supportService.WebServiceOptions$;
  ApplicationOptions$ = this.supportService.ApplicationOptions$;
  TeamOptions$ = this.supportService.TeamOptions$;
  RenderOptions$ = this.supportService.RenderOptions$;

  private issues = new BehaviorSubject<Issue[]>(null)
  Issues$ = this.issues.asObservable();

  selectedUser = new BehaviorSubject<string>('All Users');
  SelectedUser$ = this.selectedUser.asObservable().pipe(shareReplay(1));

  selectedProject = new BehaviorSubject<string>('All Projects');
  SelectedProject$ = this.selectedProject.asObservable().pipe(shareReplay(1));

  selectedBoard = new BehaviorSubject<string>('All Boards');
  SelectedBoard$ = this.selectedBoard.asObservable().pipe(shareReplay(1));

  selectedGroup = new BehaviorSubject<string>('All Groups');
  SelectedGroup$ = this.selectedGroup.asObservable().pipe(shareReplay(1));

  selectedApplication = new BehaviorSubject<string>('All Applications');
  SelectedApplication$ = this.selectedApplication.asObservable().pipe(shareReplay(1));

  selectedService = new BehaviorSubject<string>('All Webservices');
  SelectedService$ = this.selectedApplication.asObservable().pipe(shareReplay(1));

  selectedTeam = new BehaviorSubject<string>('All Teams');
  SelectedTeam$ = this.selectedApplication.asObservable().pipe(shareReplay(1));

  selectedRenderer = new BehaviorSubject<string>('All Renderers');
  SelectedRenderer$ = this.selectedRenderer.asObservable().pipe(shareReplay(1));

  selectedStatus = new BehaviorSubject<string>('All Status');
  SelectedStatus$ = this.selectedRenderer.asObservable().pipe(shareReplay(1));


  private ViewProjectMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('view_list');
  private ViewUserMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('person');
  private ViewBoardMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('dashboard');
  private ViewGroupMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('group_work');
  private ViewStatusMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('library_add_check');
  private ViewRendererNenu = this.actionOutlet.createGroup().enableDropdown().setIcon('visibility');
  private ViewTeamMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('groups')
  private ViewAppMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('wysiwyg');
  private ViewServiceMenu = this.actionOutlet.createGroup().enableDropdown().setIcon('api');

  StatusOptions$ = this.supportService.StatusOptions$;
  ViewServiceMenu$ = this.SelectedService$.pipe(
    map(([selected]) => {
      let menu = this.ViewServiceMenu;
      let options = ['All Services']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewAppMenu$ = this.SelectedApplication$.pipe(
    map(([selected]) => {
      let menu = this.ViewAppMenu;
      let options = ['All Applications']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewTeamMenu$ = this.SelectedTeam$.pipe(
    map(([selected]) => {
      let menu = this.ViewTeamMenu;
      let options = ['All Teams']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewRendererMenu$ = this.SelectedRenderer$.pipe(
    map(([selected]) => {
      let menu = this.ViewRendererNenu;
      let options = ['All Renderers']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewStatusMenu$ = this.SelectedStatus$.pipe(
    map(([selected]) => {
      let menu = this.ViewStatusMenu;
      let options = ['All Status']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewGroupMenu$ = this.SelectedGroup$.pipe(
    map(([selected]) => {
      let menu = this.ViewGroupMenu;
      let options = ['All Groups']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewUserMenu$ = this.SelectedUser$.pipe(
    map(([selected]) => {
      let menu = this.ViewUserMenu;
      let options = ['All Users']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewBoardMenu$ = this.SelectedBoard$.pipe(
    map(([selected]) => {
      let menu = this.ViewBoardMenu;
      let options = ['All Boards']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  ViewProjectMenu$ = this.SelectedProject$.pipe(
    map(([selected]) => {
      let menu = this.ViewProjectMenu;
      let options = ['All Projects']
      menu.createButton().setTitle('NYI');
      menu.setTitle(options[0]);
      return menu;
    })
  )

  IssueUpdates$ = this.supportService.IssueUpdates$;
  subscriptions = [];
  ngOnInit(): void {
    this.navigation.SetPageTitles([])
    this.subscriptions.push(
      this.supportService.Issues$.subscribe(
          (issues) => 
          this.issues.next(issues)
      )
    )

    this.subscriptions.push(
      this.supportService.IssueUpdates$.subscribe(
        (update) => this.supportService.Issues$.pipe(take(1)).subscribe(issues => this.issues.next(issues))
      )
    )
    
    this.subscriptions.push(
      this.navigation.PrimaryColor$.subscribe(c => this.primaryColor = c)
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
