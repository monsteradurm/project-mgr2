import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogHoursDlgComponent } from './log-hours-dlg.component';

describe('LogHoursDlgComponent', () => {
  let component: LogHoursDlgComponent;
  let fixture: ComponentFixture<LogHoursDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogHoursDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogHoursDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
