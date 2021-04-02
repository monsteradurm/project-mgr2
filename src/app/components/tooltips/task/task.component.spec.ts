import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTooltipComponent } from './task.component';

describe('TaskTooltipComponent', () => {
  let component: TaskTooltipComponent;
  let fixture: ComponentFixture<TaskTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
