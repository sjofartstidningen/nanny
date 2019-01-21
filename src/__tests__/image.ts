import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { promisify } from 'util';
import { resize } from '../image';

const readFile = promisify(fs.readFile);

const readImageSource = async (image: string): Promise<Buffer> =>
  readFile(path.join(__dirname, '../../test/bucket', image));

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

  it('should resize image and keep aspect if only w is defined', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, { w: 100 });
    expect(info.width).toEqual(100);
    expect(info.height).toBe(
      Math.round(
        (100 / (original.width as number)) * (original.height as number),
      ),
    );
  });

  it('should resize image and keep aspect if only h is defined', async () => {
    const file = await readImageSource('image.jpg');
    const { info, original } = await resize(file, { h: 100 });
    expect(info.height).toEqual(100);
    expect(info.width).toBe(
      Math.round(
        (100 / (original.height as number)) * (original.width as number),
      ),
    );
  });

  it('should apply both w and but keep aspect without cropping', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { w: 100, h: 100 });
    expect(info.width).toEqual(100);
    expect(info.height).toBeLessThan(100);
  });

  it('should apply both w and h and crop if also args.crop is true', async () => {
    const file = await readImageSource('image.jpg');
    const { info } = await resize(file, { w: 100, h: 100, crop: true });
    expect(info.width).toEqual(100);
    expect(info.height).toEqual(100);
  });

  it('should apply zoom to width and height', async () => {
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
});
