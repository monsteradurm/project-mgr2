import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-no-confluence',
  templateUrl: './no-confluence.component.html',
  styleUrls: ['./no-confluence.component.scss']
})
export class NoConfluenceComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private navigation:NavigationService) { }

  subscriptions = [];
  Project: string
  ngOnInit(): void {

    this.subscriptions.push(
      this.navigation.NavigationParameters$.subscribe(params => 
        {
          this.Project = params['project'];
          this.navigation.SetPageTitles([this.Project.replace('_', ' '), 'Confluence']);
        })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
