import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoConfluenceComponent } from './no-confluence.component';

describe('NoConfluenceComponent', () => {
  let component: NoConfluenceComponent;
  let fixture: ComponentFixture<NoConfluenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoConfluenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoConfluenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
