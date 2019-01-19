import { Handler, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

interface Response {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
  isBase64Encoded: boolean;
}

const processImage: Handler<APIGatewayProxyEvent, Response> = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
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
      event: { ...event, body: event.body && JSON.parse(event.body) },
    }),
    isBase64Encoded: false,
  };
};

export { processImage };
