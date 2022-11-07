import * as AWS from 'aws-sdk';
import createError from 'http-errors';
import * as mime from 'mime-types';
import { extname } from 'path';

import { getEnv } from './utils/get-env';

interface S3File {
  file: Buffer;
  info: {
    contentType?: string;
  };
}

const S3_BUCKET = getEnv('S3_BUCKET');
let s3config: AWS.S3.ClientConfiguration;

if (getEnv('NODE_ENV', 'development') === 'test') {
  s3config = {
    s3ForcePathStyle: true,
    accessKeyId: 'S3RVER',
    secretAccessKey: 'S3RVER',
    endpoint: `http://${getEnv('S3_HOSTNAME')}:${getEnv('S3_PORT')}`,
  };
} else {
  s3config = {
    region: getEnv('AWS_REGION'),
  };
}

const S3 = new AWS.S3(s3config);

/**
 * getObject will fetch an object from S3 and return it, together with some
 * information, as a buffer.
 *
 * @param {string} key The identifying key
 * @returns {Promise<S3File>}
 */
const getObject = async (key: string): Promise<S3File> => {
  try {
    const config = {
      Bucket: S3_BUCKET,
      Key: key,
    };

    const data = await S3.getObject(config).promise();
    if (!Buffer.isBuffer(data.Body)) {
      throw new createError.InternalServerError('Body returned from S3 is not of type Buffer');
    }

    const file = data.Body;
    const info = {
      contentType: data.ContentType || mime.lookup(extname(key)) || undefined,
    };

    return { file, info };
  } catch (error) {
    throw createError(error.statusCode, error.message);
  }
};

export { getObject, S3 };
