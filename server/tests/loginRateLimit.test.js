import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  checkLoginRateLimit,
  resetLoginRateLimits,
} from '../lib/loginRateLimit.js';

describe('loginRateLimit', () => {
  beforeEach(() => {
    resetLoginRateLimits();
  });

  it('allows up to 5 attempts per IP per window', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkLoginRateLimit('1.2.3.4').allowed).toBe(true);
    }
    const blocked = checkLoginRateLimit('1.2.3.4');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('tracks IPs independently', () => {
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit('a');
    }
    expect(checkLoginRateLimit('a').allowed).toBe(false);
    expect(checkLoginRateLimit('b').allowed).toBe(true);
  });
});
