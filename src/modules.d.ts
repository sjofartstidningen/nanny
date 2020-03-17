declare module 'smartcrop-sharp' {
  interface CropConfig {
    width: number;
    height: number;
  }

  interface CropResult {
    topCrop: { x: number; y: number; width: number; height: number };
  }

  export function crop(file: Buffer, config: CropConfig): Promise<CropResult>;
}

declare module 'animated-gif-detector' {
  function isAnimated(file: Buffer): boolean;
  export = isAnimated;
}
