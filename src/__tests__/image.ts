import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { resize } from '../image';
import * as Crop from '../utils/smart-crop';

const readFile = promisify(fs.readFile);

const cache = new Map<string, Buffer>();

const readImageSource = async (image: string): Promise<Buffer> => {
  const fromCache = cache.get(image);
  if (fromCache) return fromCache;

  const buffer = await readFile(path.join(__dirname, '../test-utils/bucket', image));

  cache.set(image, buffer);
  return buffer;
};

describe('Image.resize', () => {
  it('should preserve file type if args.webp is not defined', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {});
    expect(info.format).toEqual('jpeg');
  });

  it('should transform to webp if args.webp === true', async () => {
    const file = await readImageSource('image.png');
    const { info } = await resize(file, { webp: true });
    expect(info.format).toEqual('webp');
  });

  it('should by default reduce quality a bit', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, {});
    expect(info.size).toBeLessThan(original.size as number);
  });

  it('should handle ?w=100', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, { w: 100 });
    expect(info.width).toEqual(100);
    expect(info.height).toBe(Math.round((100 / (original.width as number)) * (original.height as number)));
  });

  it('should handle ?h=100', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, { h: 100 });
    expect(info.height).toEqual(100);
    expect(info.width).toBe(Math.round((100 / (original.height as number)) * (original.width as number)));
  });

  it('should handle ?w=100&h=100', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { w: 100, h: 100 });
    expect(info.width).toEqual(100);
    expect(info.height).toBeLessThan(100);
  });

  it('should handle ?w=100&h=100&crop=true', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { w: 100, h: 100, crop: true });
    expect(info.width).toEqual(100);
    expect(info.height).toEqual(100);
  });

  it('should handle ?w=100&h=100&zoom=2&crop=true', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {
      w: 100,
      h: 100,
      zoom: 2,
      crop: true,
    });
    expect(info.width).toEqual(200);
    expect(info.height).toEqual(200);
  });

  it('should handle ?crop=10,10,80,80', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, {
      crop: { x: 10, y: 10, w: 80, h: 80, unit: 'percent' },
    });
    expect(info.width).toEqual((original.width as number) * 0.8);
    expect(info.height).toEqual((original.height as number) * 0.8);
  });

  it('should handle ?crop=10px,10px,80px,80px', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {
      crop: { x: 10, y: 10, w: 80, h: 80, unit: 'pixel' },
    });
    expect(info.width).toEqual(80);
    expect(info.height).toEqual(80);
  });

  it('should handle ?resize=300,200', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { resize: { w: 300, h: 200 } });
    expect(info.width).toEqual(300);
    expect(info.height).toEqual(200);
  });

  it('should handle ?resize=300,200&zoom=2', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {
      resize: { w: 300, h: 200 },
      zoom: 2,
    });
    expect(info.width).toEqual(600);
    expect(info.height).toEqual(400);
  });

  it('should handle ?resize=300,200&gravity=north', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {
      resize: { w: 300, h: 200 },
      gravity: 'north',
    });
    expect(info.width).toEqual(300);
    expect(info.height).toEqual(200);
  });

  it('should handle ?resize=300,200&crop_strategy=attention', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, {
      resize: { w: 300, h: 200 },
      crop_strategy: 'attention',
    });
    expect(info.width).toEqual(300);
    expect(info.height).toEqual(200);
  });

  it('should handle ?resize=300,200&crop_strategy=attention', async () => {
    const file = await readImageSource('image.jpg');
    const spy = jest.spyOn(Crop, 'smartCrop');

    const { info } = await resize(file, {
      resize: { w: 300, h: 200 },
      crop_strategy: 'smart',
    });

    expect(info.width).toEqual(300);
    expect(info.height).toEqual(200);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('should handle ?fit=300,300', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, { fit: { w: 300, h: 300 } });

    expect(info.width).toEqual(300);
    expect(info.height).toBeCloseTo((original.height as number) * (300 / (original.width as number)));
  });

  it('should handle ?lb=300,300', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { lb: { w: 300, h: 300 } });

    expect(info.width).toEqual(300);
    expect(info.height).toEqual(300);
  });
});
