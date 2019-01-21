import sharp from 'sharp';
import { ResizeArgs } from './types';
import { clamp } from './utils/fp';

interface ResizeResult {
  image: Buffer;
  info: sharp.OutputInfo;
  original: sharp.Metadata;
}

const applyZoomCompression = (defaultValue: number, zoom: number): number =>
  clamp(
    Math.round(
      defaultValue -
        (Math.log(zoom) / Math.log(defaultValue / zoom)) *
          (defaultValue * zoom),
    ),
    Math.round(defaultValue / zoom),
    defaultValue,
  );

const resize = async (
  file: Buffer,
  args: ResizeArgs,
): Promise<ResizeResult> => {
  const Image = sharp(file).withMetadata();
  const metadata = await Image.metadata();

  // Auto image rotate based on orientation exif data
  Image.rotate();

  const zoom = args.zoom || 1;
  const quality = Math.round(
    clamp(args.quality || applyZoomCompression(82, zoom), 0, 100),
  );

  /**
   * Apply resizing
   */
  // TODO: Apply resizing and crop
  if (args.w || args.h) {
    Image.resize(args.w ? args.w * zoom : null, args.h ? args.h * zoom : null);
    // @ts-ignore
    if (!args.crop) Image.max();
  }

  /**
   * Set the final format of the image and set quality
   * If args.webp is true then all images becomes webp. Otherwise everything
   * will be set to its initial format, except gif and svg which will become png
   */

  if (args.webp || metadata.format === 'webp') {
    Image.webp({ quality });
  } else if (metadata.format === 'jpeg') {
    Image.jpeg({ quality });
  } else {
    Image.png();
  }

  const { data: image, info } = await Image.toBuffer({
    resolveWithObject: true,
  });

  return { image, info, original: metadata };
};

export { resize };
