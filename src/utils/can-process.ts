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

const canProcess = (
  file: Buffer,
  { contentType, key }: { key: string; contentType?: string },
): boolean => {
  if (!allowedMimeTypes.includes(contentType || extname(key))) return false;
  if (isAnimated(file)) return false;
  return true;
};

export { canProcess };
