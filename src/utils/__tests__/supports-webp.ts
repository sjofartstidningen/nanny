import { supportsWebp } from '../supports-webp';

describe('Util: supportsWebp', () => {
  it('should determine if client supports webp', () => {
    expect(supportsWebp({ Accept: 'image/webp' })).toBeTruthy();
    expect(supportsWebp({ Accept: 'image/*' })).toBeFalsy();
    expect(
      supportsWebp({
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      }),
    ).toBeTruthy();
    expect(supportsWebp({ Foo: 'bar' })).toBeFalsy();
    expect(supportsWebp()).toBeFalsy();
  });
});
