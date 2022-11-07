interface PredicateFunction<T> {
  (item: T): boolean; // tslint:disable-line
}

/**
 * allPass checks if every item in the array passes the predicate function
 * It will bail out as soon as a false value is found
 *
 * @template T
 * @param {PredicateFunction<T>} predicate Boolean returning function to check if an item passes
 * @param {T[]} items
 * @returns {boolean}
 */
const allPass = <T>(predicate: PredicateFunction<T>, items: T[]): boolean => {
  let pass = true;

  for (const item of items) {
    pass = predicate(item);
    if (!pass) return pass;
  }

  return pass;
};

/**
 * anyPass checks if any item in the array passes the predicate function
 * It will bail out as soon as a true value is returned
 *
 * @template T
 * @param {PredicateFunction<T>} predicate Boolean returning function to check if an item passes
 * @param {T[]} items
 * @returns {boolean}
 */
const anyPass = <T>(predicate: PredicateFunction<T>, items: T[]): boolean => {
  let pass = false;

  for (const item of items) {
    pass = predicate(item);
    if (pass) return pass;
  }

  return pass;
};

/**
 * capitalize every word in a string. It will split words by anything that is
 * not a word charachter (\W in reg exp). This means that something like
 * "content-type" => "Content-Type" and "hello world" => "Hello World".
 *
 * @param {string} str String to capitalize
 * @returns {string} Capitalized string
 */
const capitalize = (str: string): string => {
  return str.replace(/\w+/g, (substring) => {
    const [init, ...rest] = substring.split('');
    return `${init.toUpperCase()}${rest.join('')}`;
  });
};

/**
 * clamp constrains a number between min and max
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};

/**
 * isEmpty will check if an object is empty.
 *
 * @example
 *   isEmpty({}) === true
 *   isEmpty({ a: 1 }) === false
 *   isEmpty([]) === true
 *   isEmpty([1]) === false
 *
 * @param {object} o Any type of object (e.g. Object, Array or class instance)
 * @returns {boolean}
 */
const isEmpty = (o: object): boolean => {
  return Object.keys(o).length < 1;
};

export { allPass, anyPass, capitalize, clamp, isEmpty };
