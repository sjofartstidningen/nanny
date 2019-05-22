import * as fs from 'fs';
import { Server } from 'http';
import { lookup } from 'mime-types';
import * as os from 'os';
import * as path from 'path';
import S3rver from 's3rver';
import { promisify } from 'util';
import { S3 } from '../s3';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const createServer = ({
  hostname,
  port,
}: {
  hostname: string;
  port: number;
}): Promise<Server> =>
  new Promise((resolve, reject) => {
    const instance = new S3rver({
      hostname,
      port,
      directory: path.join(os.tmpdir(), '/s3'),
      silent: true,
      // @ts-ignore: not valid param according to S3rverOptions
      removeBucketsOnClose: true,
    });

    const server = instance.run((error: Error) => {
      if (error) return reject(error);
      return resolve(server);
    });
  });

const uploadToBucket = async ({
  key,
  filePath,
  bucket,
}: {
  key: string;
  filePath: string;
  bucket: string;
}) => {
  const bufferContent = await readFile(filePath);

  const ext = path.extname(filePath).substring(1);
  const contentType = lookup(ext) || undefined;

  await S3.putObject({
    Key: key,
    Bucket: bucket,
    Body: bufferContent,
    ContentType: contentType,
  }).promise();
};

const populateBucket = async (bucket: string, bucketDir: string) => {
  const files = await readdir(bucketDir);
  await Promise.all(
    files.map(key => {
      const filePath = path.join(bucketDir, key);
      return uploadToBucket({ key, filePath, bucket });
    }),
  );
};

const createScope = ({
  hostname,
  port,
  bucket,
}: {
  hostname: string;
  port: number;
  bucket: string;
}) => {
  let server: Server;

  const init = async (populate = true): Promise<void> => {
    server = await createServer({ hostname, port });
    const { Buckets } = await S3.listBuckets().promise();
    const hasBucket = Array.isArray(Buckets)
      ? Buckets.findIndex(b => b.Name === bucket) > -1
      : false;

    if (!hasBucket) await S3.createBucket({ Bucket: bucket }).promise();
    if (populate) await populateBucket(bucket, path.join(__dirname, 'bucket'));
  };

  const teardown = (): Promise<void> =>
    new Promise(async (resolve, reject) => {
      server.close(err => {
        if (err) return reject(err);
        resolve();
      });
    });

  return {
    init,
    teardown,
    populate: (dir: string) => populateBucket(bucket, dir),
  };
};

export { createScope };
