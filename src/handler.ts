import { APIGatewayProxyEvent, Callback, Context, Handler } from 'aws-lambda';
import { HttpError } from 'http-errors';
import { parseQuery } from './utils';

interface Response {
  statusCode: number;
  headers: object;
  body: string;
  isBase64Encoded: boolean;
}

const processImage: Handler<APIGatewayProxyEvent, Response> = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  try {
    const queryArgs = parseQuery(event.queryStringParameters || {});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': `application/json`,
        'Cache-Control': `max-age=${365 * 24 * 60 * 60}`,
        'Last-Modified': new Date().toUTCString(),
      },
      body: JSON.stringify({
        message: 'Hello world',
        env: process.env.NODE_ENV,
        queryArgs,
      }),
      isBase64Encoded: false,
    };
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

    return {
      statusCode,
      headers: { 'Content-Type': 'text/plain' },
      body: message,
      isBase64Encoded: false,
    };
  }
};

export { processImage };
