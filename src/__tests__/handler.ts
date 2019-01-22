const bucket = 'handler-bucket';
const hostname = 'localhost';
const port = 1234;

process.env.S3_BUCKET = bucket;
process.env.S3_HOSTNAME = hostname;
process.env.S3_PORT = `${port}`;

import sharp from 'sharp';
import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';
import { createScope } from '../test-utils/s3-server';

const scope = createScope({ hostname, port, bucket });
beforeAll(() => scope.init());
afterAll(() => scope.teardown());

describe.only('handler: processImage', () => {
  it('should transform an image before returning it', async () => {
    const event = mockApiGatewayEvent({
      path: '/image.jpg',
      queryStringParameters: { w: '100' },
    });
    const context = mockLambdaContext();

    const result = await processImage(event, context);
    expect(result).toHaveProperty('body');
    expect(result.headers).toHaveProperty('Content-Type', 'image/jpeg');

    const file = Buffer.from(result.body, 'base64');
    const metadata = await sharp(file).metadata();
    expect(metadata).toHaveProperty('width', 100);
  });

  it('should return an image in webp format if supported and FORCE_WEBP=true', async () => {
    process.env.FORCE_WEBP = 'true';

    const event = mockApiGatewayEvent({
      path: '/image.jpg',
      queryStringParameters: { w: '100' },
      headers: { Accept: 'image/webp,image/apng,image/*,*/*;q=0.8' }, // Crome default for image requests
    });
    const context = mockLambdaContext();

    const result = await processImage(event, context);
    expect(result.headers).toHaveProperty('Content-Type', 'image/webp');

    const file = Buffer.from(result.body, 'base64');
    const metadata = await sharp(file).metadata();
    expect(metadata).toHaveProperty('format', 'webp');

    process.env.FORCE_WEBP = undefined;
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
