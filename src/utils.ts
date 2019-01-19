import { BadRequest } from 'http-errors';
import mapValues from 'lodash.mapvalues';
import { QueryArgs, ResizeArgs } from './types';

const int = (s: string): number => Number.parseInt(s, 10);
const isNaN = (n: number): boolean => Number.isNaN(n);

const parseNumber = (val: string): number => {
  const num = int(val);
  if (isNaN(num)) throw new Error(`"${val}" is not a number`);
  return num;
};

const parseList = (val: string) => {
  const [w, h] = val.split(',');
  if (w == null || h == null || isNaN(int(w)) || isNaN(int(h))) {
    throw new Error(
      `"${val}" must be a comma separated list (<width>,<height>)`,
    );
  }

  return { w: int(w), h: int(h) };
};

const parseBoolean = (val: string) => {
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;

  throw new Error(
    `"${val}" is not valid as a boolean value. Must be either true (or 1) or false (or 0)`,
  );
};

const parseCrop = (val: string) => {
  try {
    const ret = parseBoolean(val);
    return ret;
  } catch (error) {
    const [x, y, w, h] = val.split(',');
    if (
      x == null ||
      y == null ||
      w == null ||
      h == null ||
      isNaN(int(x)) ||
      isNaN(int(y)) ||
      isNaN(int(w)) ||
      isNaN(int(h))
    ) {
      throw new Error(
        `"${val}" must be a comma separated list (<x>,<y>,<width>,<height>)`,
      );
    }

    return { x: int(x), y: int(y), w: int(w), h: int(h) };
  }
};

const parseEnum = (validEntries: string[]) => (val: string) => {
  if (!validEntries.includes(val)) {
    throw new Error(`"${val}" must be one of ${validEntries.join(', ')}.`);
  }

  return val;
};

const parsers = {
  w: parseNumber,
  h: parseNumber,
  quality: parseNumber,
  zoom: parseNumber,
  resize: parseList,
  fit: parseList,
  lb: parseList,
  crop: parseCrop,
  webp: parseBoolean,
  crop_strategy: parseEnum(['smart', 'entropy', 'attention']),
  gravity: parseEnum([
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
  background: (val: string) => val,
};

const parseQuery = (query: QueryArgs): ResizeArgs => {
  const args = mapValues(query, (val, key: keyof QueryArgs) => {
    try {
      if (!val) return undefined;
      if (parsers[key]) return parsers[key](val);
      return undefined;
    } catch (error) {
      const err = new BadRequest(
        `${key} is not valid. Reason: ${error.message}`,
      );

      throw err;
    }
  });

  return args as ResizeArgs;
};

export { parseQuery };
