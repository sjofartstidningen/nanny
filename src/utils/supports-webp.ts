interface Headers {
  [header: string]: string;
}

/**
 * supportsWebp uses the Accept-header passed with the request. For browsers
 * [supporting WebP](https://caniuse.com/#feat=webp) this header wil include
 * the substring 'image/webp'.
 *
 * @param {Headers} [headers={}]
 * @returns {boolean}
 */
const supportsWebp = ({ Accept }: Headers = {}): boolean => {
  return !!Accept && Accept.includes('image/webp');
};

export { supportsWebp };
