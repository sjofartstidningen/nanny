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

export interface ResizeArgs {
  w?: number;
  h?: number;
  quality?: number;
  resize?: { w: number; h: number };
  crop_strategy?: CropStrategy;
  gravity?: Gravity;
  fit?: { w: number; h: number };
  crop?: boolean | { x: number; y: number; w: number; h: number };
  zoom?: number;
  webp?: boolean;
  lb?: { w: number; h: number };
  background?: string;
}

export interface QueryArgs {
  [key: string]: string;
}

export enum AllowedExtensions {
  jpeg = 'jpeg',
  jpg = 'jpg',
  png = 'png',
  webp = 'webp',
  gif = 'gif',
  svg = 'svg',
}
