import sharp from 'sharp';
import { Dimensions, ResizeArgs } from './types';
import { clamp } from './utils/fp';
import { smartCrop } from './utils/smart-crop';

interface ResizeResult {
  image: Buffer;
  info: sharp.OutputInfo;
  original: sharp.Metadata;
}

/**
 * Calculate a default compression value based on a logarithmic scale depending
 * on the zoom
 *
 * @param {number} defaultValue Default quality
 * @param {number} zoom Zoom level
 * @returns {number} Calculated quality
 */
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

/**
 * calculateDimensions takes the dimensions and applies the zoom value onto them
 *
 * @param {Dimensions} dimensions Dimensions
 * @param {number} [zoom=1] Zoom value
 * @returns {[number, number]} Dimensions with zoom applied
 */
const calculateDimensions = (
  dimensions: Dimensions,
  zoom: number = 1,
): [number, number] => {
  const width = Math.round(dimensions.w * zoom);
  const height = Math.round(dimensions.h * zoom);
  return [width, height];
};

/**
 * resize will take the buffer object from S3 and apply resize, crop and format
 * onto it before it can be returned to the client.
 *
 * A user might supply many different combinations of arguments but this tries
 * to not apply multiple operations that might conflict with each other
 *
 * @param {Buffer} file The buffer object from S3
 * @param {ResizeArgs} args Arguments parsed from the query string
 * @returns {Promise<ResizeResult>} Resulting image buffer with additional data
 */
const resize = async (
  file: Buffer,
  args: ResizeArgs,
): Promise<ResizeResult> => {
  const Image = sharp(file).withMetadata();
  const metadata = await Image.metadata();

  // Auto rotate image based on orientation exif data
  Image.rotate();

  const zoom = args.zoom || 1;

  /**
   * By default this function will use a quality slightly higher than sharp's
   * default (80) and also reduce the quality a bit for zoomed up images to
   * compensate for the bigger size
   */
  const quality = Math.round(
    clamp(args.quality || applyZoomCompression(82, zoom), 0, 100),
  );

  /**
   * Apply cropping if args.crop is a CropRect, an object
   * The crop value can be supplied as either pixels or percentages
   * It they are supplied as percentages the zoom factor will be applied
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
    /**
     * Query param "resize" can be used to force an image into a specific box.
     * The values are passed as a comma separated tuple (?resize=100,200).
     * Aspect ration will be kept
     *
     * The params "gravity" or "crop_strategy" can be used to control where to
     * put focus while cropping – default is center gravity
     *
     * @see src/types.js for information about which values are accepted as
     * gravity or strategy.
     */
    const [width, height] = calculateDimensions(args.resize, zoom);

    const options: sharp.ResizeOptions = {};
    if (args.gravity) {
      options.position = args.gravity;
    } else if (args.crop_strategy === 'attention') {
      options.position = sharp.strategy.attention;
    } else if (args.crop_strategy === 'entropy') {
      options.position = sharp.strategy.entropy;
    } else if (args.crop_strategy === 'smart') {
      const [w, h] = calculateDimensions(args.resize);
      const smartRegion = await smartCrop(file, { width: w, height: h });

      Image.extract({
        left: smartRegion.x,
        top: smartRegion.y,
        width: smartRegion.width,
        height: smartRegion.height,
      });
    }

    Image.resize(width, height, options);
  } else if (args.fit) {
    /**
     * Query parameter fit will take the dimensions and scale the image but make
     * it fit into the resulting rect while still keeping aspect ratio
     */
    const [width, height] = calculateDimensions(args.fit, zoom);
    Image.resize(width, height, { fit: 'inside' });
  } else if (args.lb) {
    /**
     * Query parameter lb (or letter-box) will take the image, scale it to fit
     * inside the dimensions while keeping the aspect ration. It will then apply
     * a background color to the whitespace around the image.
     *
     * By default the backgorund will be black – but any hex value can be passed
     * to add another type of color – remember to escape the `#` to `%23`.
     */
    const [width, height] = calculateDimensions(args.lb, zoom);
    Image.resize(width, height, {
      fit: 'contain',
      background: args.background || 'black',
    });
  } else if (args.w || args.h) {
    /**
     * Use query parameters w or h to scale the image to a specified width or
     * height while keeping aspect ratio.
     *
     * Both together, without param crop, will work as query param
     * resize. If crop = true it will work as param fit.
     */
    Image.resize(
      args.w ? args.w * zoom : null,
      args.h ? args.h * zoom : null,
      !args.crop ? { fit: 'inside' } : undefined,
    );
  }

  /**
   * Finally set the output format of the image and set quality.
   * If args.webp is true then all images becomes webp. Otherwise everything
   * will be set to its initial format, except gif and svg which will become
   * png.
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
