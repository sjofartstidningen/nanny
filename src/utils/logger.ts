import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import winston from 'winston';

import { getEnv } from './get-env';

const isDev = getEnv('NODE_ENV', 'development') === 'development';
const isTest = getEnv('NODE_ENV', 'development') === 'test';

const payload: { [key: string]: any } = {};
const lambda = winston.format((info) => {
  return { ...info, ...payload };
});

const errorJson = winston.format((info) => {
  if (info.level === 'error' && info.error) {
    const { error } = info;
    info.error = {
      message: error.message || error.toString(),
      stack: error.stack,
    };
  }

  return info;
});

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports: [new winston.transports.Console()],
  silent: isTest,
  format: winston.format.combine(lambda(), errorJson(), winston.format.json()),
});

const init = (event: APIGatewayProxyEvent, context: Context) => {
  if (event) {
    payload.event = {
      ...(payload.event || {}),
      path: event.path,
      headers: event.headers,
      queryStringParameters: event.queryStringParameters,
    };
  }
  if (context) payload.awsRequestId = context.awsRequestId;
};

export { logger, init };
