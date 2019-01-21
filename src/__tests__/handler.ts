import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';

describe('handler: processImage', () => {
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
