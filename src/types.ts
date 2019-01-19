export interface ResizeArgs {
  w?: number;
  h?: number;
  quality?: number;
  resize?: { w: number; h: number };
  crop_strategy?: string;
  gravity?: string;
  fit?: { w: number; h: number };
  crop?: boolean | { x: number; y: number; w: number; h: number };
  zoom?: number;
  webp?: boolean;
  lb?: { w: number; h: number };
  background?: string;
}

export interface QueryArgs {
  w?: string;
  h?: string;
  quality?: string;
  resize?: string;
  crop_strategy?: string;
  gravity?: string;
  fit?: string;
  crop?: string;
  zoom?: string;
  webp?: string;
  lb?: string;
  background?: string;
}
