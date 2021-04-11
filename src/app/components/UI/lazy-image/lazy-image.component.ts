import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-lazy-image',
  templateUrl: './lazy-image.component.html',
  styleUrls: ['./lazy-image.component.scss']
})
export class LazyImageComponent implements OnInit {

  @Input() image: string;

  HasLoaded: boolean = false;
  @Input() height: string;
  @Input() width: string;
  @Input() minHeight: string;
  @Input() color: string;
  @Input() lazySize: number = 250;
  @Input() borderRadius: string = '10px';
  @Input() borderStyle: string = 'solid';
  @Input() borderWidth: string ='1px';
  @Input() borderColor: string = 'black';

  constructor() { }

  StateChanged(evt) {
    switch(evt.reason) {
      case 'loading-succeeded':
        this.HasLoaded = true;
      break;
    }
  }
  ngOnInit(): void {
  }

}
