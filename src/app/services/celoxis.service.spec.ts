import { TestBed } from '@angular/core/testing';

import { CeloxisService } from './celoxis.service';

describe('CeloxisService', () => {
  let service: CeloxisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CeloxisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
