import { APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError } from 'http-errors';

type Body = string | object | Buffer;
interface Config {
  statusCode?: number;
  cache?: boolean | number;
  contentType?: string;
  headers?: { [header: string]: string | number | boolean };
}

/**
 * createResponse will taken the intended body and create a proper response
 * object that API Gateway understands.
 *
 * Some constraints though:
 * - If the body is a Buffer a contentType must be provided
 * - If the body is a string text/plain will be used unless a specific
 *   contentType is provided
 * - If body anything else it will be transformed by JSON.stringify and
 *   application/json will be used as contentType (unless provided)
 *
 * By default everything will be cached for 31,536,000 seconds (1 year).
 * If cache is set to false the header Cache-Control will equal "no-cache".
 * If cache is a number that number will be used as max-age.
 *
 * Note that you can override this (if you need some special Cache-Control
 * setting) by providing a Cache-Control in config.headers.
 *
 * @param {Body} body The intended body as a string, object (will be JSON) or a Buffer
 * @param {Config} [{ statusCode = 200, cache = true, contentType, headers }={}]
 * @returns {APIGatewayProxyResult}
 */
const createResponse = (
  body: Body,
  { statusCode = 200, cache = true, contentType, headers }: Config = {},
): APIGatewayProxyResult => {
  const isBuffer = Buffer.isBuffer(body);
  const isPlainText = typeof body === 'string';

  /**
   * In order to properly return a binary response a Content-Type header must be
   * provided to API Gateway – otherwise the response will just be a plain
   * string.
   */
  if (isBuffer && !contentType) {
    throw new InternalServerError('If body is passed as a buffer a contentType must be passed');
  }

  return {
    statusCode,
    headers: {
      'Content-Type': contentType || (isPlainText ? 'text/plain' : 'application/json'),
      'Cache-Control':
        typeof cache === 'number' ? `max-age=${cache}` : cache ? `max-age=${365 * 24 * 60 * 60}` : 'no-cache',
      'Last-Modified': new Date().toUTCString(),
      ...(headers ? headers : null),
    },
    body: isBuffer ? body.toString('base64') : typeof body === 'string' ? body : JSON.stringify(body),
    isBase64Encoded: isBuffer,
  };
};

export { createResponse };
