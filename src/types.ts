export interface APIGatewayResponse {
  statusCode: number;
  headers: object;
  body: string;
  isBase64Encoded: boolean;
}

export type CropStrategy = 'smart' | 'attention' | 'entropy';
export type Gravity =
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'center';

export interface Dimensions {
  w: number;
  h: number;
}
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
  unit: 'pixel' | 'percent';
}

export interface ResizeArgs {
  w?: number;
  h?: number;
  quality?: number;
  resize?: Dimensions;
  crop_strategy?: CropStrategy;
  gravity?: Gravity;
  fit?: Dimensions;
  crop?: boolean | CropRect;
  zoom?: number;
  webp?: boolean;
  lb?: Dimensions;
  background?: string;
}

export interface QueryArgs {
  [key: string]: string | undefined;
}

export enum AllowedExtensions {
  jpeg = 'jpeg',
  jpg = 'jpg',
  png = 'png',
  webp = 'webp',
  gif = 'gif',
  svg = 'svg',
}
