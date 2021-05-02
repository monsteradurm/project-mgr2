import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanBoardItemComponent } from './kanban-board-item.component';

describe('KanbanBoardItemComponent', () => {
  let component: KanbanBoardItemComponent;
  let fixture: ComponentFixture<KanbanBoardItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KanbanBoardItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanBoardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
