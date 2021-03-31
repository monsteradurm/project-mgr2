import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewBoarditemComponent } from './overview-boarditem.component';

describe('OverviewBoarditemComponent', () => {
  let component: OverviewBoarditemComponent;
  let fixture: ComponentFixture<OverviewBoarditemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewBoarditemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewBoarditemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
