const bucket = 'test-bucket';
const hostname = 'localhost';
const port = 4578;

process.env.S3_BUCKET = bucket;
process.env.S3_HOSTNAME = hostname;
process.env.S3_PORT = `${port}`;

import { NotFound } from 'http-errors';
import { createScope } from '../../test/s3-server';
import { getObject } from '../s3';

const scope = createScope({ hostname, port, bucket });
beforeAll(() => scope.init());
afterAll(() => scope.teardown());

describe('S3.getObject', () => {
  it('should fetch an object from s3 and return it as a buffer', async () => {
    const res = await getObject('image.jpg');
    expect(Buffer.isBuffer(res.file)).toBeTruthy();
    expect(res.info.contentType).toEqual('image/jpeg');
  });

  it('should handle any type of object', async () => {
    await Promise.all(
      ['document.pdf', 'data.json'].map(async key => {
        const file = await await getObject(key);
        expect(Buffer.isBuffer(file.file)).toBeTruthy();
        expect(file.info.contentType).toMatch(/application\/\w+/);
      }),
    );
  });

  it('should throw NotFound error if file is not found', async () => {
    await expect(getObject('no-image.jpg')).rejects.toThrow(NotFound);
  });
});
