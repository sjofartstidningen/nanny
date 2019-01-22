import * as smartcrop from 'smartcrop-sharp';

const smartCrop = async (
  file: Buffer,
  { width, height }: { width: number; height: number },
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const result = await smartcrop.crop(file, { width, height });
  return result.topCrop;
};

export { smartCrop };
