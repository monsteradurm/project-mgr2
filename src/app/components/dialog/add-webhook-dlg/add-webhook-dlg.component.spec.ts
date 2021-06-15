import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWebhookDlgComponent } from './add-webhook-dlg.component';

describe('AddWebhookDlgComponent', () => {
  let component: AddWebhookDlgComponent;
  let fixture: ComponentFixture<AddWebhookDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWebhookDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWebhookDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
