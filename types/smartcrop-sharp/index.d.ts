declare module 'smartcrop-sharp' {
  export interface SmartcropOptions {
    width: number;
    height: number;
  }

  export interface SmartcropResult {
    topCrop: {
      x: number;
      y: number;
      width: number;
      height: number;
      score: {
        detail: number;
        saturation: number;
        skin: number;
        boost: number;
        total: number;
      };
    };
  }

  export function crop(file: Buffer, options: SmartcropOptions): Promise<SmartcropResult>;
}
