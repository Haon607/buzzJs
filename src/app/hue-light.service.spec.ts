import { TestBed } from '@angular/core/testing';

import { HueLightService } from './hue-light.service';

describe('HueLightService', () => {
  let service: HueLightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HueLightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
