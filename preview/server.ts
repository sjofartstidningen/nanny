/* tslint:disable: no-console */
const serverPort = 3000;
const serverHostname = 'localhost';
const s3Port = 4578;
const s3Bucket = 'example-bucket';

process.env.NODE_ENV = 'test';
process.env.SERVER_PORT = '3000';
process.env.SERVER_HOSTNAME = 'localhost';
process.env.S3_HOSTNAME = 'localhost';
process.env.S3_PORT = '4578';
process.env.S3_BUCKET = 'example-bucket';

import exitHook from 'async-exit-hook';
import { APIGatewayProxyHandler } from 'aws-lambda';
import http from 'http';
import { join } from 'path';
import { performance, PerformanceObserver } from 'perf_hooks';
import {
  mockApiGatewayEvent,
  mockLambdaContext,
} from '../src/__fixtures__/aws-lambda';
import { processImage } from '../src/handler';
import { createScope } from '../src/test-utils/s3-server';
import { capitalize } from '../src/utils/fp';

const obs = new PerformanceObserver(items => {
  const entry = items.getEntries()[0];
  console.log(`[${entry.name}] ${entry.duration}ms`);
  performance.clearMarks();
});

obs.observe({ entryTypes: ['measure'] });

const transformHeaders = (
  headers: http.IncomingHttpHeaders,
): { [header: string]: string } => {
  return Object.keys(headers).reduce(
    (acc, key) => ({
      ...acc,
      [capitalize(key)]: headers[key],
    }),
    {},
  );
};

const lambdaProxyAdapter = (handler: APIGatewayProxyHandler) => async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> => {
  const headers = transformHeaders(req.headers);
  const { pathname: path, searchParams } = new URL(
    `http://localhost:3000${req.url}`,
  );

  const queryStringParameters: { [key: string]: string } = {};
  searchParams.forEach((val, key) => {
    queryStringParameters[key] = val;
  });

  const event = mockApiGatewayEvent({ path, queryStringParameters, headers });
  const context = mockLambdaContext();
  const cb = () => null;

  performance.mark('handler-start');
  const result = await handler(event, context, cb);
  performance.mark('handler-end');

  if (result) {
    res.writeHead(
      result.statusCode,
      result.headers as http.OutgoingHttpHeaders,
    );

    if (result.isBase64Encoded) {
      res.end(Buffer.from(result.body, 'base64'), 'binary');
    } else {
      res.end(result.body);
    }
  }

  const queryString = Object.keys(queryStringParameters)
    .map(key => `${key}=${queryStringParameters[key]}`)
    .join('&');
  performance.measure(
    `${path}${queryString ? '?' : ''}${queryString}`,
    'handler-start',
    'handler-end',
  );
};

async function setupServer({
  handler,
  port,
  hostname,
}: {
  handler: APIGatewayProxyHandler;
  port: number;
  hostname: string;
}): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    try {
      const server = http.createServer(lambdaProxyAdapter(handler));
      server.listen(port, hostname, (error: Error) => {
        if (error) return reject(error);
        return resolve(server);
      });
    } catch (error) {
      return reject(error as Error);
    }
  });
}

async function setupS3({
  bucket,
  folder,
  port,
  hostname,
}: {
  bucket: string;
  folder: string;
  port: number;
  hostname: string;
}) {
  const s3 = createScope({ hostname, port, bucket });

  await s3.init(false);
  await s3.populate(folder);

  return () => s3.teardown();
}

async function main() {
  let destroyS3: () => Promise<void> | undefined;
  let server: http.Server | undefined;

  exitHook(async () => {
    if (destroyS3) await destroyS3();
    if (server) server.close();
  });

  try {
    destroyS3 = await setupS3({
      bucket: process.env.S3_BUCKET,
      folder: join(process.cwd(), 'preview/bucket'),
      port: Number.parseInt(process.env.S3_PORT, 10),
      hostname: process.env.S3_HOSTNAME,
    });

    server = await setupServer({
      handler: processImage,
      port: Number.parseInt(process.env.SERVER_PORT, 10),
      hostname: process.env.SERVER_HOSTNAME,
    });

    console.log(
      `Server listening on http://${process.env.SERVER_HOSTNAME}:${
        process.env.SERVER_PORT
      }`,
    );
    console.log(
      `S3 listening on http://${process.env.S3_HOSTNAME}:${
        process.env.S3_PORT
      }\n`,
    );
  } catch (error) {
    console.error(error);
  }
}

main();
