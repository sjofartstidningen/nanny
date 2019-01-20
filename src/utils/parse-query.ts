import { BadRequest } from 'http-errors';
import mapValues from 'lodash.mapvalues';
import { CropStrategy, Gravity, QueryArgs, ResizeArgs } from '../types';
import { anyPass } from './fp';

const int = (s: string): number => Number.parseInt(s, 10);
const isNaN = (n: number): boolean => Number.isNaN(n);

const anyIsNull = (l: any[]) => anyPass(v => v == null, l);
const anyIsNaN = (l: number[]) => anyPass(Number.isNaN, l);

const parseNumber = (val: string): number => {
  const num = int(val);
  if (isNaN(num)) throw new Error(`"${val}" is not a number`);
  return num;
};

const parseList = (val: string) => {
  const [w, h] = val.split(',');
  if (anyIsNull([w, h]) || anyIsNaN([int(w), int(h)])) {
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
    if (anyIsNull([x, y, w, h]) || anyIsNaN([int(x), int(y), int(w), int(h)])) {
      throw new Error(
        `"${val}" must be a comma separated list (<x>,<y>,<width>,<height>)`,
      );
    }

    return { x: int(x), y: int(y), w: int(w), h: int(h) };
  }
};

const parseEnum = <T>(validEntries: T[]) => (val: any): T => {
  if (!validEntries.includes(val)) {
    throw new Error(`"${val}" must be one of ${validEntries.join(', ')}.`);
  }

  return val as T;
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
  crop_strategy: parseEnum<CropStrategy>(['smart', 'entropy', 'attention']),
  gravity: parseEnum<Gravity>([
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
  const keys = Object.keys(query);
  const args: ResizeArgs = keys.reduce((a: ResizeArgs, key: string) => {
    try {
      const val = query[key as keyof QueryArgs];
      const parser = parsers[key as keyof QueryArgs];

      if (val && parser) return { ...a, [key]: parser(val) };
      return a;
    } catch (error) {
      throw new BadRequest(
        `Query parameter "${key}" is not valid. Reason: ${error.message}`,
      );
    }
  }, {});

  return args as ResizeArgs;
};

export { parseQuery };
