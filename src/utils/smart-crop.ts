import { CropOptions } from 'smartcrop';
import { crop } from 'smartcrop-sharp';

/**
 * smartCrop will determine the most interesting area inside an image and pass
 * a CropRect that can be used in Sharp.extract – this method is more advanced
 * than sharps builtin crop strategies
 */
export async function smartCrop(file: Buffer, options: CropOptions) {
  const result = await crop(file, options);
  return result.topCrop;
}
