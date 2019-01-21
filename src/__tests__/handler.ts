import { Forbidden } from 'http-errors';
import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';

describe('handler: processImage', () => {
  it('should return a APIProxyEvent', async () => {
    const event = mockApiGatewayEvent();
    const context = mockLambdaContext();
    const result = await processImage(event, context);

    expect(result).toEqual(expect.any(Object));
  });

  it('should throw an error if trying to access root level', async () => {
    const event = mockApiGatewayEvent();
    const context = mockLambdaContext();

    event.path = '/';

    await expect(processImage(event, context)).resolves.toHaveProperty(
      'statusCode',
      403,
    );
  });

  it('should throw an error if trying to access folder', async () => {
    const event = mockApiGatewayEvent();
    const context = mockLambdaContext();

    event.path = '/path/to/folder';

    await expect(processImage(event, context)).resolves.toHaveProperty(
      'statusCode',
      403,
    );
  });
});
