import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const toMultipart = <Value>(obj: {
  [key: string]: Value;
}): { [key: string]: Value[] } => {
  return Object.entries(obj).reduce(
    (o, [key, val]) => ({ ...o, [key]: [val] }),
    {},
  );
};

const defaultHeaders = { Accept: 'application/json' };
const defaultQueryStringParameters = { foo: 'bar' };

interface MockEventConfig {
  body?: string | null;
  path?: string;
  headers?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
}

const mockApiGatewayEvent = ({
  body = null,
  path = '/path/to/resource',
  headers = defaultHeaders,
  queryStringParameters = defaultQueryStringParameters,
}: MockEventConfig = {}): APIGatewayProxyEvent => ({
  body,
  path,
  headers,
  queryStringParameters,
  multiValueHeaders: toMultipart(headers),
  multiValueQueryStringParameters: toMultipart(queryStringParameters),
  httpMethod: 'POST',
  isBase64Encoded: false,
  pathParameters: { proxy: path },
  stageVariables: { baz: 'qux' },
  requestContext: {
    accountId: '123456789012',
    resourceId: '123456',
    stage: 'prod',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTimeEpoch: 1428582896000,
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      apiKey: null,
      apiKeyId: null,
      accessKey: null,
      sourceIp: '127.0.0.1',
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'Custom User Agent String',
      user: null,
    },
    path: '/prod/path/to/resource',
    resourcePath: '/{proxy+}',
    httpMethod: 'POST',
    apiId: '1234567890',
  },
  resource: '/{proxy+}',
});

const mockLambdaContext = (): Context => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'functionName',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'invokedFunctionArn',
  memoryLimitInMB: 512,
  awsRequestId: 'awsRequestId',
  logGroupName: 'logGroupName',
  logStreamName: 'logStreamName',
  getRemainingTimeInMillis: () => Math.floor(Math.random() * 10_000),
  done: () => null,
  fail: () => null,
  succeed: () => null,
});

export { mockApiGatewayEvent, mockLambdaContext };
