/**
 * getEnv tries to retrieve a variable from process.env
 * If no default value is defined (which means that it's undefined) will result
 * in this function throwing an error
 *
 * It a default value this will be returned instead if process.env[variable] is
 * not defined
 *
 * @template T
 * @param {string} variableName Name of variable to access on process.env
 * @param {T} [defaultValue] Optional default value to pass if variable is not defined
 * @returns {(string | T)} Envirnoment variable value or defaultValue
 */
function getEnv(variableName: string): string;
function getEnv<T>(variableName: string, defaultValue: T): string | T;
function getEnv<T>(variableName: string, defaultValue?: T): string | T {
  const env = process.env[variableName] || defaultValue;
  if (typeof env === 'undefined') {
    throw new Error(`Env variable ${variableName} is not defined`);
  }

  return env;
}

export { getEnv };
