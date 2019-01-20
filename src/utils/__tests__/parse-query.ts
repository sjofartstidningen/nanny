import { BadRequest } from 'http-errors';
import { parseQuery } from '../parse-query';

describe('util: parseQuery', () => {
  it('should parse the queryStringParametersObject passed from a lambda event', () => {
    const queryStringParameters = {
      w: '100',
      h: '100',
      quality: '50',
      resize: '100,100',
      crop_strategy: 'smart',
      gravity: 'north',
      fit: '100,100',
      crop: 'true',
      zoom: '2',
      webp: 'true',
      lb: '100,100',
      background: 'red',
    };

    const result = parseQuery(queryStringParameters);
    expect(result).toEqual({
      w: 100,
      h: 100,
      quality: 50,
      resize: { w: 100, h: 100 },
      crop_strategy: 'smart',
      gravity: 'north',
      fit: { w: 100, h: 100 },
      crop: true,
      zoom: 2,
      webp: true,
      lb: { w: 100, h: 100 },
      background: 'red',
    });
  });

  it('should properly handle the crop values', () => {
    expect(parseQuery({ crop: 'true' })).toEqual({ crop: true });
    expect(parseQuery({ crop: '1' })).toEqual({ crop: true });
    expect(parseQuery({ crop: 'false' })).toEqual({ crop: false });
    expect(parseQuery({ crop: '0' })).toEqual({ crop: false });
    expect(parseQuery({ crop: '10,10,90,90' })).toEqual({
      crop: { x: 10, y: 10, w: 90, h: 90 },
    });
  });

  it('should throw if passed misformatted params', () => {
    expect(() => parseQuery({ w: 'one-hundred' })).toThrow(BadRequest);
    expect(() => parseQuery({ resize: '100' })).toThrow(BadRequest);
    expect(() => parseQuery({ crop: 'tru' })).toThrow(BadRequest);
    expect(() => parseQuery({ crop: '100,12' })).toThrow(BadRequest);
    expect(() => parseQuery({ crop_strategy: 'zmart' })).toThrow(BadRequest);
    expect(() => parseQuery({ gravity: 'top' })).toThrow(BadRequest);
  });
});
