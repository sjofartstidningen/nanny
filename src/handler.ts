import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { Forbidden, HttpError } from 'http-errors';
import * as mime from 'mime-types';
import { extname } from 'path';
import * as Image from './image';
import * as S3 from './s3';
import { canProcess } from './utils/can-process';
import { createResponse } from './utils/create-response';
import { getEnv } from './utils/get-env';
import { parseQuery } from './utils/parse-query';
import { supportsWebp } from './utils/supports-webp';

async function processImage(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  try {
    const key = event.path.substring(1);
    const extension = extname(key)
      .substring(1)
      .toLowerCase();

    if (!key || !extension)
      throw new Forbidden('Not allowed to access folders');

    const query = event.queryStringParameters || {};
    const resizeArgs = parseQuery(query);
    if (getEnv('FORCE_WEBP', false)) {
      resizeArgs.webp = supportsWebp(event.headers);
    }

    const { file, info: fileInfo } = await S3.getObject(key);
    const contentType =
      fileInfo.contentType || mime.lookup(extension) || undefined;

    if (!(await canProcess(file, { key, contentType }))) {
      return createResponse(file, { contentType });
    }

    const { image, info: imageInfo } = await Image.resize(file, resizeArgs);
    return createResponse(image, {
      contentType: mime.lookup(imageInfo.format) || undefined,
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
