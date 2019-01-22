import isAnimated from 'animated-gif-detector';
import * as mime from 'mime-types';
import { extname } from 'path';

const allowedMimeTypes = [
  mime.lookup('png'),
  mime.lookup('jpg'),
  mime.lookup('gif'),
  mime.lookup('svg'),
  mime.lookup('webp'),
];

/**
 * canProcess will determine if the object fetched from S3 is processable by our
 * image process based on [sharp](https://github.com/lovell/sharp).
 *
 * This function will first check if the provided contentType is in the array of
 * allowed mime-types if not it will return false.
 * Then, if the contentType is image/gif it will check if it's an animated gif –
 * if so it will also return false.
 *
 * If all checks pass the object can be processed by our image processor.
 *
 * @param {Buffer} file The buffer representation of the S3 object
 * @param {{ key: string; contentType?: string }} { contentType, key }
 * @returns {boolean}
 */
const canProcess = (
  file: Buffer,
  { contentType, key }: { key: string; contentType?: string },
): boolean => {
  const type = contentType || mime.lookup(extname(key));
  if (!allowedMimeTypes.includes(type)) return false;
  if (type === allowedMimeTypes[2] && isAnimated(file)) return false;
  return true;
};

export { canProcess };
