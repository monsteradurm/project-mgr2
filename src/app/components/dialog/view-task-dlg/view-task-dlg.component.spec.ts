import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaskDlgComponent } from './view-task-dlg.component';

describe('ViewTaskDlgComponent', () => {
  let component: ViewTaskDlgComponent;
  let fixture: ComponentFixture<ViewTaskDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTaskDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTaskDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
