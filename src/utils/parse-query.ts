import { BadRequest } from 'http-errors';
import { evolve } from 'ramda';
import { CropStrategy, Gravity, QueryArgs, ResizeArgs } from '../types';
import { anyPass } from './fp';

const identity = <R>(x: R): R => x;
const int = (s: string): number => Number.parseInt(s, 10);
const isNaN = (n: number): boolean => Number.isNaN(n);

const anyIsNull = (l: any[]) => anyPass(v => v == null, l);
const anyIsNaN = (l: number[]) => anyPass(Number.isNaN, l);

const parseNumber = (key: string) => (val: string): number => {
  const num = int(val);
  if (isNaN(num))
    throw new Error(`Parameter "${key}" is not a number. Supplied: ${val}`);
  return num;
};

const parseList = (key: string) => (val: string) => {
  const [w, h] = val.split(',');
  if (anyIsNull([w, h]) || anyIsNaN([int(w), int(h)])) {
    throw new Error(
      `Parameter "${key}" must be a comma separated list (<width>,<height>). Supplied: ${val}`,
    );
  }

  return { w: int(w), h: int(h) };
};

const parseBoolean = (key: string) => (val: string) => {
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;

  throw new Error(
    `Parameter "${key}" is not valid as a boolean value. Must be either true (or 1) or false (or 0). Supplied: ${val}`,
  );
};

const parseCrop = (key: string) => (val: string) => {
  try {
    const ret = parseBoolean(key)(val);
    return ret;
  } catch (error) {
    const [x, y, w, h] = val.split(',');
    if (anyIsNull([x, y, w, h]) || anyIsNaN([int(x), int(y), int(w), int(h)])) {
      throw new Error(
        `Parameter "${key}" must be a comma separated list (<x>,<y>,<width>,<height>) or a boolean value. Supplied: ${val}`,
      );
    }

    return { x: int(x), y: int(y), w: int(w), h: int(h) };
  }
};

const parseEnum = <T>(key: string, validEntries: T[]) => (val: any): T => {
  if (!validEntries.includes(val)) {
    throw new Error(
      `Parameter "${key}" must be one of ${validEntries.join(
        ', ',
      )}. Supplied: ${val}`,
    );
  }

  return val as T;
};

const evolver = {
  w: parseNumber('w'),
  h: parseNumber('h'),
  quality: parseNumber('quality'),
  zoom: parseNumber('zoom'),
  resize: parseList('resize'),
  fit: parseList('fit'),
  lb: parseList('lb'),
  crop: parseCrop('crop'),
  webp: parseBoolean('webp'),
  crop_strategy: parseEnum<CropStrategy>('crop_strategy', [
    'smart',
    'entropy',
    'attention',
  ]),
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

const parseQuery = (query: QueryArgs): ResizeArgs => {
  try {
    return evolve(evolver, query);
  } catch (error) {
    throw new BadRequest(
      `Query parameters not valid. Reason: ${error.message}`,
    );
  }
};

export { parseQuery };
