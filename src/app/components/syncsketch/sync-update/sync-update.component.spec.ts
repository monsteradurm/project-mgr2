import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncUpdateComponent } from './sync-update.component';

describe('SyncUpdateComponent', () => {
  let component: SyncUpdateComponent;
  let fixture: ComponentFixture<SyncUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyncUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
