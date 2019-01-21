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
