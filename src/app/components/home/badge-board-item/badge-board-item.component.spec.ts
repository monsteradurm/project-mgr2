import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeBoardItemComponent } from './badge-board-item.component';

describe('BadgeBoardItemComponent', () => {
  let component: BadgeBoardItemComponent;
  let fixture: ComponentFixture<BadgeBoardItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeBoardItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeBoardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
