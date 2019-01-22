import * as smartcrop from 'smartcrop-sharp';

/**
 * smartCrop will determine the most interesting area inside an image and pass
 * a CropRect that can be used in Sharp.extract – this method is more advanced
 * than sharps builtin crop strategies
 *
 * @param {Buffer} file A buffer representation of the image
 * @param {{ width: number; height: number }} dimensions Intended width and height of image
 * @returns {Promise<{ x: number; y: number; width: number; height: number }>}
 */
const smartCrop = async (
  file: Buffer,
  { width, height }: { width: number; height: number },
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const result = await smartcrop.crop(file, { width, height });
  return result.topCrop;
};

export { smartCrop };
