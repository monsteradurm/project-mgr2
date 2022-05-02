import { Component, Input, OnInit } from '@angular/core';
import { HomeComponent } from '../home.component';

@Component({
  selector: 'app-badge-board-item',
  templateUrl: './badge-board-item.component.html',
  styleUrls: ['./badge-board-item.component.scss']
})
export class BadgeBoardItemComponent implements OnInit {

  @Input() Title: string;
  @Input() primaryColor;

  constructor(public parent: HomeComponent) { }

  firebase = this.parent.firebase;
  Items$ = this.parent.Items$;

  AllBadgesEarned$ = this.firebase.AllBadgesEarned$;

  ngOnInit(): void {
  }

}
