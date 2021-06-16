import { Component, OnDestroy, OnInit } from '@angular/core';
import { TypeformService } from 'src/app/services/typeform.service';
import { PeopleComponent } from '../../people.component';

@Component({
  selector: 'app-typeforms',
  templateUrl: './typeforms.component.html',
  styleUrls: ['./typeforms.component.scss']
})
export class TypeformsComponent implements OnInit, OnDestroy {

  constructor(private parent: PeopleComponent, public typeform: TypeformService) { }

  subscriptions = [];
  primaryColor = "rgb(153, 87, 255)";

  Forms$ = this.typeform.Forms$;

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {

  }
}
