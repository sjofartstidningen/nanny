const bucket = 'handler-bucket';
const hostname = 'localhost';
const port = 1234;

process.env.S3_BUCKET = bucket;
process.env.S3_HOSTNAME = hostname;
process.env.S3_PORT = `${port}`;

import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';
import { createScope } from '../test-utils/s3-server';

const scope = createScope({ hostname, port, bucket });
beforeAll(() => scope.init());
afterAll(() => scope.teardown());

describe.skip('handler: processImage', () => {
  it('should return a APIProxyEvent', async () => {
    const event = mockApiGatewayEvent({ path: '/image.jpg' });
    const context = mockLambdaContext();
    const result = await processImage(event, context);

    expect(JSON.parse(result.body)).toHaveProperty('message', 'Hello world');
  });

  it('should throw an error if trying to access root level', async () => {
    const event = mockApiGatewayEvent({ path: '/' });
    const context = mockLambdaContext();

    await expect(processImage(event, context)).resolves.toHaveProperty(
      'statusCode',
      403,
    );
  });

  it('should throw an error if trying to access folder', async () => {
    const event = mockApiGatewayEvent({ path: '/path/to/folder' });
    const context = mockLambdaContext();

    await expect(processImage(event, context)).resolves.toHaveProperty(
      'statusCode',
      403,
    );
  });
});
