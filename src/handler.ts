import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { Forbidden, HttpError } from 'http-errors';
import { extname } from 'path';
import { AllowedExtensions } from './types';
import { createResponse } from './utils/create-response';
import { isEmpty } from './utils/fp';
import { getEnv } from './utils/get-env';
import { parseQuery } from './utils/parse-query';
import { supportsWebp } from './utils/supports-webp';

async function processImage(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  try {
    const key = event.path.substring(1);
    const ext = extname(key)
      .substring(1)
      .toLowerCase();

    if (!key || !ext) throw new Forbidden('Not allowed to access folders');

    const query = event.queryStringParameters || {};
    const resizeArgs = parseQuery(query);
    if (getEnv('FORCE_WEBP', false)) {
      resizeArgs.webp = supportsWebp(event.headers);
    }

    // const { file, info: fileInfo } = await S3.getObject(key);

    // if (!(ext in AllowedExtensions) || isEmpty(resizeArgs) || isAnimatable(file)) {
    //   return createResponse(file, { contentType: fileInfo.contentType });
    // }

    // const { image, info: imageInfo } = await Image.resize(file, resizeArgs);
    // return createResponse(image, { contentType: imageInfo.contentType });

    return createResponse({
      message: 'Hello world',
      env: process.env,
      event,
    });
  } catch (error) {
    let statusCode: number;
    let message: string;

    if (error instanceof HttpError && error.expose) {
      statusCode = error.statusCode;
      message = error.message;
    } else {
      statusCode = 500;
      message = 'Internal server error';
    }

    return createResponse(message, { statusCode });
  }
}

export { processImage };
