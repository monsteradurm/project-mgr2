import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit {

  constructor(public element: ElementRef) { }

  Ids: number[] | string[];
  primaryColor: string;
  type: string =  'Monday';
  ngOnInit(): void {
  }

}
