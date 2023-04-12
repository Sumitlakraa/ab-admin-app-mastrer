import { TestBed } from '@angular/core/testing';

import { ConcessionService } from './concession.service';

describe('ConcessionService', () => {
  let service: ConcessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
