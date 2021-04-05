import { TestBed } from '@angular/core/testing';

import { SyncSketchService } from './sync-sketch.service';

describe('SyncSketchService', () => {
  let service: SyncSketchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncSketchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
