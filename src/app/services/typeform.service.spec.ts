import { TestBed } from '@angular/core/testing';

import { TypeformService } from './typeform.service';

describe('TypeformService', () => {
  let service: TypeformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
