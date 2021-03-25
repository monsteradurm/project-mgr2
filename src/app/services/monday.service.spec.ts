import { TestBed } from '@angular/core/testing';

import { MondayService } from './monday.service';

describe('MondayService', () => {
  let service: MondayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MondayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
