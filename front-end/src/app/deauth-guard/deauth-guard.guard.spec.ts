import { TestBed } from '@angular/core/testing';

import { DeauthGuardGuard } from './deauth-guard.guard';

describe('DeauthGuardGuard', () => {
  let guard: DeauthGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DeauthGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
