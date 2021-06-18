import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCommentComponent } from './app-comment.component';

describe('AppCommentComponent', () => {
  let component: AppCommentComponent;
  let fixture: ComponentFixture<AppCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
