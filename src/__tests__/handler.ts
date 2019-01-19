import { processImage } from '../handler';
import {
  generateApiGatewayEvent,
  generateContext,
} from '../../test/fixtures/aws-lambda';

describe('handler: processImage', () => {
  it('should return a APIProxyEvent', async () => {
    const event = generateApiGatewayEvent();
    const context = generateContext();
    const callback = jest.fn();
    const result = await processImage(event, context, callback);

    expect(result).toEqual(expect.any(Object));
    expect(callback).not.toHaveBeenCalled();
  });
});
