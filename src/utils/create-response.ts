import { APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError } from 'http-errors';

type Body = string | object | Buffer;
interface Config {
  statusCode?: number;
  cache?: boolean;
  contentType?: string;
}

const createResponse = (
  body: string | object | Buffer,
  { statusCode = 200, cache = true, contentType }: Config = {},
): APIGatewayProxyResult => {
  const isBuffer = Buffer.isBuffer(body);
  const isPlainText = typeof body === 'string';

  if (isBuffer && !contentType) {
    throw new InternalServerError(
      'If body is passed as buffer a contentType must be passed',
    );
  }

  return {
    statusCode,
    headers: {
      'Content-Type':
        contentType || isPlainText ? 'text/plain' : 'application/json',
      'Cache-Control': cache ? `max-age=${365 * 24 * 60 * 60}` : 'no-cache',
      'Last-Modified': new Date().toUTCString(),
    },
    body: isBuffer
      ? body.toString('base64')
      : typeof body === 'string'
      ? body
      : JSON.stringify(body),
    isBase64Encoded: isBuffer,
  };
};

export { createResponse };
