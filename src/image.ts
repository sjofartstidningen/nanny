import sharp from 'sharp';
import { ResizeArgs } from './types';
import { clamp } from './utils/fp';
import { smartCrop } from './utils/smart-crop';

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

const getDimensionsArray = (
  dimensions: { w: number; h: number },
  zoom: number = 1,
): [number, number] => {
  const width = Math.round(dimensions.w * zoom);
  const height = Math.round(dimensions.h * zoom);
  return [width, height];
};

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
  if (typeof args.crop === 'object') {
    const extractRegion =
      args.crop.unit === 'pixel'
        ? {
            left: args.crop.x,
            top: args.crop.y,
            width: args.crop.w,
            height: args.crop.h,
          }
        : {
            left: (metadata.width as number) * (args.crop.x / 100),
            top: (metadata.height as number) * (args.crop.y / 100),
            width: (metadata.width as number) * (args.crop.w / 100),
            height: (metadata.height as number) * (args.crop.h / 100),
          };

    Image.extract(extractRegion);
  }

  if (args.resize) {
    const [width, height] = getDimensionsArray(args.resize, zoom);

    if (args.gravity) {
      // @ts-ignore
      Image.crop(args.gravity);
    }

    if (args.crop_strategy === 'attention') {
      // @ts-ignore
      Image.crop(sharp.strategy.attention);
    }

    if (args.crop_strategy === 'entropy') {
      // @ts-ignore
      Image.crop(sharp.strategy.entropy);
    }

    if (args.crop_strategy === 'smart') {
      const intendedDimensions = getDimensionsArray(args.resize);
      const smartRegion = await smartCrop(file, {
        width: intendedDimensions[0],
        height: intendedDimensions[1],
      });

      Image.extract({
        left: smartRegion.x,
        top: smartRegion.y,
        width: smartRegion.width,
        height: smartRegion.height,
      });
    }

    Image.resize(width, height);
  } else if (args.fit) {
    const [width, height] = getDimensionsArray(args.fit, zoom);
    Image.resize(width, height);
    // @ts-ignore
    Image.max();
  } else if (args.lb) {
    const [width, height] = getDimensionsArray(args.lb, zoom);
    Image.resize(width, height);

    // @ts-ignore
    Image.background(args.background || 'black');
    // @ts-ignore
    Image.embed();
  } else if (args.w || args.h) {
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
