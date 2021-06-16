import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeformsComponent } from './typeforms.component';

describe('TypeformsComponent', () => {
  let component: TypeformsComponent;
  let fixture: ComponentFixture<TypeformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeformsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
