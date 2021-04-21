import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceDlgComponent } from './reference.-dlgcomponent';

describe('ReferenceDlgComponent', () => {
  let component: ReferenceDlgComponent;
  let fixture: ComponentFixture<ReferenceDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
