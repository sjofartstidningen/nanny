import { parseQuery } from '../utils';

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
    expect(parseQuery({ crop: 'false' })).toEqual({ crop: false });
    expect(parseQuery({ crop: '10,10,90,90' })).toEqual({
      crop: { x: 10, y: 10, w: 90, h: 90 },
    });
  });
});
