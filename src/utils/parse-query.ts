import { BadRequest } from 'http-errors';
import { evolve } from 'ramda';

import { CropRect, CropStrategy, Dimensions, Gravity, QueryArgs, ResizeArgs } from '../types';
import { anyPass } from './fp';

const identity = <R>(x: R) => x;
const int = (s: string): number => Number.parseInt(s, 10);
const isNaN = (n: number): boolean => Number.isNaN(n);

const anyIsNull = (l: any[]) => anyPass((v) => v == null, l);
const anyIsNaN = (l: number[]) => anyPass(Number.isNaN, l);

/**
 * parseInteger transforms a stringified number into an int "1" -> 1
 *
 * @param {string} key
 * @returns {(val: string) => number} A function to format the query value
 */
const parseInteger =
  (key: string) =>
  (val: string): number => {
    const num = int(val);
    if (isNaN(num)) throw new Error(`Parameter "${key}" is not a number. Supplied: ${val}`);
    return num;
  };

/**
 * parseFloating transforms a stringified number into float "1.5" -> 1.5
 *
 * @param {string} key
 * @returns {(val: string) => number} A function to format the query value
 */
const parseFloating =
  (key: string) =>
  (val: string): number => {
    const num = Number.parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Parameter "${key}" is not a number. Supplied: ${val}`);
    }

    return num;
  };

/**
 * parseTuple transforms a comma separated list of two values into an object of
 * width and height – "200,100" -> { w: 200, h: 100 }
 *
 * @param {string} key
 * @returns {(val: string) => Dimensions} A function to format the query value
 */
const parseTuple =
  (key: string) =>
  (val: string): Dimensions => {
    const [w, h] = val.split(',');
    if (anyIsNull([w, h]) || anyIsNaN([int(w), int(h)])) {
      throw new Error(`Parameter "${key}" must be a comma separated list (<width>,<height>). Supplied: ${val}`);
    }

    return { w: int(w), h: int(h) };
  };

/**
 * parseBoolean transforms an expected boolean string into an actual boolean. It
 * accepts either "true" or "1" to return true, or "false" or "0" to return
 * false.
 *
 * @param {string} key
 * @returns {(val: string) => boolean} A function to format the query value
 */
const parseBoolean =
  (key: string) =>
  (val: string): boolean => {
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;

    throw new Error(
      `Parameter "${key}" is not valid as a boolean value. Must be either true (or 1) or false (or 0). Supplied: ${val}`,
    );
  };

/**
 * parseCrop handles one specific property – crop
 * It can accept either a boolean value (true, false, 1, 0) to accept cropping
 * while resizing. Or a comma separated list of numbers indicating the area to
 * crop out (topOffset, leftOffset, width, height) either in percent values (no
 * suffix) or as pixels (px-suffix)
 *
 * @param {string} key
 * @returns {(val: string) => boolean | CropRect} A function to format the query value
 */
const parseCrop =
  (key: string) =>
  (val: string): boolean | CropRect => {
    try {
      const ret = parseBoolean(key)(val);
      return ret;
    } catch (error) {
      const cropValues = val.split(',').map(int);

      if (cropValues.length < 4 || anyIsNaN(cropValues)) {
        throw new Error(
          `Parameter "${key}" must be a comma separated list of pixel or percent values (<x>,<y>,<width>,<height>) or a boolean value. Supplied: ${val}`,
        );
      }

      const [x, y, w, h] = cropValues;
      return { x, y, w, h, unit: val.includes('px') ? 'pixel' : 'percent' };
    }
  };

/**
 * parseEnum takes a list of acceptable values and checks if the provided value
 * exists in that array. If not an error will be thrown with the reason.
 *
 * @template T
 * @param {string} key
 * @param {T[]} validEntries
 * @returns {(val: T) => T} A function to format the query value
 */
const parseEnum =
  <T extends string>(key: string, validEntries: T[]) =>
  (val: T): T => {
    if (!validEntries.includes(val)) {
      throw new Error(`Parameter "${key}" must be one of ${validEntries.join(', ')}. Supplied: ${val}`);
    }

    return val;
  };

/**
 * This object contains functions to map a queryStringParameters object into a
 * ResizeArgs object
 *
 * Every prop in the query object is a string and these small utility functions
 * will transform these strings into there intended value
 */
const evolver = {
  w: parseInteger('w'),
  h: parseInteger('h'),
  quality: parseInteger('quality'),
  zoom: parseFloating('zoom'),
  resize: parseTuple('resize'),
  fit: parseTuple('fit'),
  lb: parseTuple('lb'),
  crop: parseCrop('crop'),
  webp: parseBoolean('webp'),
  crop_strategy: parseEnum<CropStrategy>('crop_strategy', ['smart', 'entropy', 'attention']),
  gravity: parseEnum<Gravity>('gravity', [
    'north',
    'northeast',
    'east',
    'southeast',
    'south',
    'southwest',
    'west',
    'northwest',
    'center',
  ]),
  background: identity,
};

/**
 * parseQuery takes a queryStringParameters object from the API Gateway event
 * and transforms it into an options object that can be passed to
 * Image.processImage.
 *
 * This function will take a query object with any type of arguments and only
 * the intersecting props between the query and the evolve-object will be
 * returned.
 *
 * E.g. { w: '100', foo: 'bar' } -> { w: 100 }
 *
 * But if any value has incorrect formatting a BadRequest error will be thrown
 * and the image will not be processed – it will not fail silently
 *
 * @param {QueryArgs} query queryStringParameters object from APIGatewayProxyEvent
 * @returns {ResizeArgs} An arguments object to pass into Image.processImage
 */
const parseQuery = (query: QueryArgs): ResizeArgs => {
  try {
    return evolve(evolver, query);
  } catch (error) {
    let message = '<unknown>';
    if (error instanceof Error) {
      message = error.message;
    }

    throw new BadRequest(`Query parameters not valid. Reason: ${message}`);
  }
};

export { parseQuery };
