import sharp from 'sharp';
import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';

jest.mock('../s3');

describe('handler: processImage', () => {
  it('should transform an image before returning it', async () => {
    const event = mockApiGatewayEvent({
      path: '/image.jpg',
      queryStringParameters: { w: '100' },
    });
    const context = mockLambdaContext();

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

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

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

    expect(result.headers).toHaveProperty('Content-Type', 'image/webp');

    const file = Buffer.from(result.body, 'base64');
    const metadata = await sharp(file).metadata();
    expect(metadata).toHaveProperty('format', 'webp');

    process.env.FORCE_WEBP = undefined;
  });

  it('should ignore FORCE_WEBP and Accept-header if webp is declared in query string', async () => {
    process.env.FORCE_WEBP = 'true';

    const event = mockApiGatewayEvent({
      path: '/image.jpg',
      queryStringParameters: { webp: 'false' },
      headers: { Accept: 'image/webp,image/apng,image/*,*/*;q=0.8' }, // Crome default for image requests
    });
    const context = mockLambdaContext();

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

    expect(result.headers).toHaveProperty('Content-Type', 'image/jpeg');
    process.env.FORCE_WEBP = undefined;
  });

  it('should throw an error if trying to access root level', async () => {
    const event = mockApiGatewayEvent({ path: '/' });
    const context = mockLambdaContext();

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

    expect(result).toHaveProperty('statusCode', 403);
  });

  it('should throw an error if trying to access folder', async () => {
    const event = mockApiGatewayEvent({ path: '/path/to/folder' });
    const context = mockLambdaContext();

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

    expect(result).toHaveProperty('statusCode', 403);
  });

  it('should encode incoming path in order to accept special chars', async () => {
    const key = encodeURI('/image-åäö.jpg');
    const event = mockApiGatewayEvent({ path: key });
    const context = mockLambdaContext();

    const callback = jest.fn();
    await processImage(event, context, callback);
    const result = callback.mock.calls[0][1];

    expect(result).toHaveProperty('statusCode', 200);
  });
});
