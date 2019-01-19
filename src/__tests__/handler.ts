import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../__fixtures__/aws-lambda';
import { processImage } from '../handler';

describe('handler: processImage', () => {
  it('should return a APIProxyEvent', async () => {
    const event = mockApiGatewayEvent();
    const context = mockLambdaContext();
    const callback = jest.fn();
    const result = await processImage(event, context, callback);

    expect(result).toEqual(expect.any(Object));
    expect(callback).not.toHaveBeenCalled();
  });
});
