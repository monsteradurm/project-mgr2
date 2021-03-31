import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewSubitemComponent } from './overview-subitem.component';

describe('OverviewSubitemComponent', () => {
  let component: OverviewSubitemComponent;
  let fixture: ComponentFixture<OverviewSubitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewSubitemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewSubitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
