import { Component, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {


  constructor(private box: BoxService, 
    private navigation: NavigationService,
    private userService: UserService) { 
    this.navigation.Component.DisplayNavigation = 'none';
  }

  primaryColor = 'gray';
  Fetching = true;

  private boxRoot = new BehaviorSubject<string>(null);
  BoxRoot$ = this.boxRoot.asObservable().pipe(shareReplay(1));

  @Output() Workspace: string;
  @Output() Root: string;

  User$ = this.userService.User$;
  MyPhoto$ = this.userService.MyPhoto$;

  subscriptions = [];
  ngOnInit(): void {
    this.subscriptions.push(
      this.navigation.NavigationParameters$.subscribe((params:any) => {
        console.log(params.workspace);
        if (params.workspace)
          this.Workspace = params.workspace;

        if (params.root)
          this.Root = params.root;
      })
    )

  }


}
