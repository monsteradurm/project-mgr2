import { Component, OnInit, Input } from '@angular/core';
import { UserIdentity } from './../../../models/UserIdentity';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @Input() User : UserIdentity;
  @Input() Photo : any;
  
  constructor() { }

  ngOnInit(): void {
  }

}