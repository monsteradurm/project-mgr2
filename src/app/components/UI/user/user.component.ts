import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { UserIdentity } from './../../../models/UserIdentity';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @Input() User : UserIdentity;
  @Input() Photo : any;
  @Input() CircleOnly : boolean = false;
  @Input() textColor : string = 'black';
  @Input() borderColor: string = 'white';
  @Input() backgroundColor: string = 'gray';
  @Input() borderStyle: string = 'none';
  @Input() borderWidth: string = '1px';
  @Input() IsNav: boolean = false;
  @Input() FlipText: boolean = false;
  @Input() Photo$ : Observable<any>;
  @Input() CircleWidth: string = '27px';
  constructor() { }

  ngOnInit(): void {
  }

}