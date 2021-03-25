import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewGanttComponent } from './overview-gantt.component';

describe('OverviewGanttComponent', () => {
  let component: OverviewGanttComponent;
  let fixture: ComponentFixture<OverviewGanttComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewGanttComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewGanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
