import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxWebhooksComponent } from './box-webhooks.component';

describe('BoxWebhooksComponent', () => {
  let component: BoxWebhooksComponent;
  let fixture: ComponentFixture<BoxWebhooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxWebhooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxWebhooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
