import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit {
  @HostListener('mouseenter', ['$event']) onMouseEnter(evt) {
    this.IsMouseOver = true;
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(evt) {
    this.IsMouseOver = false;
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    this.IsMouseOver = true;
  }

  constructor(public element: ElementRef) { }

  IsMouseOver:boolean = false;
  Ids: number[] | string[];
  primaryColor: string;
  type: string =  'Monday';

  Date: moment.Moment;
  ngOnInit(): void {
  }

}
