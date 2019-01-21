const getEnv = (
  variableName: string,
  defaultValue: string | null = null,
): string => {
  const env = process.env[variableName] || defaultValue;
  if (env == null)
    throw new Error(`Env variable ${variableName} is not defined`);
  return env;
};

export { getEnv };
