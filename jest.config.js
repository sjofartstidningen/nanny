module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/.serverless/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
};
