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

/**
 * processImage will respond to a API Gateway GET event and probably return an
 * image by following these steps:
 *                                                           |  this part  |
 * 1. It'll take the path part of the url (e.g https://ex.co/path/toimg.jpg) and
 *    use it as a key to fetch an object from an S3 Bucket.
 *
 * 2. This object will be evaluated and checked to see it's actually an image –
 *    since it is possible to store any type of file in S3.
 *    If it's not an image (or an animated gif) it will only be proxied thru
 *    without further processing.
 *
 * 3. The program will then use [sharp](https://github.com/lovell/sharp) to
 *    resize and format the image before sending it to the client
 *
 * Since these operations might be heavy, depending on the size of the images,
 * this Lambda should be placed behind an AWS CloudFront distribution to avoid
 * unnecessary invokations.
 *
 * @note In future this handler might be enhanced to also support
 * [Client Hints](https://developers.google.com/web/updates/2015/09/automating-resource-selection-with-client-hints)
 *
 * @param {APIGatewayProxyEvent} event Event object from API Gateway
 * @param {Context} context AWS Lambda context with info about the environment
 * @returns {Promise<APIGatewayProxyResult>} An object processable by API Gateway
 */
async function processImage(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  try {
    // The S3 key is the path part excluding the leading "/"
    const key = event.path.substring(1);
    const extension = extname(key)
      .substring(1)
      .toLowerCase();

    /**
     * If there's no key or extension the request is malformed and might be an
     * attempt to list the contents of the S3 bucket – this is not allowed.
     */
    if (!key || !extension) {
      throw new Forbidden('Not allowed to access folders');
    }

    const query = event.queryStringParameters || {};
    const resizeArgs = parseQuery(query);

    /**
     * If the env variable FORCE_WEBP is set we will use the Accept-header to
     * determine whether the client supports webp or not. It it supports we
     * will force the image to be transformed into webp which often will mean
     * great size reductions
     */
    if (getEnv('FORCE_WEBP', false)) {
      resizeArgs.webp = supportsWebp(event.headers);
    }

    /**
     * The object is fetched from S3 and returned as a Buffer
     * @note It might be worth checking to see if there are any gains in using
     * [lru-cache](https://github.com/isaacs/node-lru-cache) to skip some
     * requests to S3 during heavy load.
     */
    const { file, info: fileInfo } = await S3.getObject(key);
    const contentType =
      fileInfo.contentType || mime.lookup(extension) || undefined;

    /**
     * We need to check that the file fetched from S3 actually is an image that
     * can be processed by sharp – that means we need to check the contentType
     * and see if it's one that we can handle.
     *
     * But we also need to check if the file might be an animated gif – in that
     * case we will not process it since sharp will only return a static gif
     *
     * It we can't process the file it will only be proxied to the client
     *
     * @note A possible enhancement might be to look into using ffmpeg to
     * process animated gifs and either preserve the gif format or –
     * [if the browser supports it](https://calendar.perfplanet.com/2017/animated-gif-without-the-gif/)
     * – return the gif as .mp4.
     */
    if (!canProcess(file, { key, contentType })) {
      return createResponse(file, { contentType });
    }

    /**
     * This is the heavy part of this handler. It will take the file-buffer and
     * resize it according to the query string parameters – see documentation
     * for the various ways to process the image.
     */
    const { image, info: imageInfo } = await Image.resize(file, resizeArgs);
    return createResponse(image, {
      contentType: mime.lookup(imageInfo.format) || undefined,
      headers: { Vary: 'Accept' },
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

    return createResponse(message, { statusCode, cache: false });
  }
}

export { processImage };
