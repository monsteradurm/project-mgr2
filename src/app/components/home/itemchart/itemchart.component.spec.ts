import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemchartComponent } from './itemchart.component';

describe('ItemchartComponent', () => {
  let component: ItemchartComponent;
  let fixture: ComponentFixture<ItemchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemchartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
