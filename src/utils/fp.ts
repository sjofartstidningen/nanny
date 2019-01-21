const allPass = <T>(predicate: (val: T) => boolean, values: T[]): boolean => {
  let pass = true;

  for (const val of values) {
    pass = predicate(val);
    if (!pass) return pass;
  }

  return pass;
};

const anyPass = <T>(predicate: (val: T) => boolean, values: T[]): boolean => {
  let pass = false;

  for (const val of values) {
    pass = predicate(val);
    if (pass) return pass;
  }

  return pass;
};

const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};

const isEmpty = (o: object): boolean => {
  return Object.keys(o).length < 1;
};

export { allPass, anyPass, clamp, isEmpty };
