import { TestBed } from '@angular/core/testing';
import { BuzzDeviceService } from './buzz-device.service';

describe('BussDeviceService', () => {
  let service: BuzzDeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuzzDeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
