import fs from 'node:fs/promises';
import path from 'node:path';

import mime from 'mime-types';

const bucketPath = path.join(__dirname, '../test-utils/bucket');

export const getObject = jest.fn(async (key: string) => {
  const filePath = path.join(bucketPath, key);
  const file = await fs.readFile(filePath);
  const contentType = mime.lookup(path.extname(key));

  return {
    file,
    info: { contentType },
  };
});

export const setupS3 = jest.fn();

export const S3 = jest.fn();
