import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss']
})
export class MobileComponent implements OnInit {

  constructor() { }
  @Input() IsAuthorized: boolean = false;
  @Input() User: any;
  @Input() MyPhoto: any;

  ngOnInit(): void {
  }

}
