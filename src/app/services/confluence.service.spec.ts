import { TestBed } from '@angular/core/testing';

import { ConfluenceService } from './confluence.service';

describe('ConfluenceService', () => {
  let service: ConfluenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfluenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
