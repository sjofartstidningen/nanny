import { getEnv } from '../get-env';

describe('Util: getEnv', () => {
  it('should return an environment variable, or throw if not defined', () => {
    expect(getEnv('NODE_ENV')).toEqual('test');
    expect(() => getEnv('FOO')).toThrow(Error);
  });

  it('should fallback to default value if provided', () => {
    expect(getEnv('FOO', 'bar')).toEqual('bar');
  });
});
