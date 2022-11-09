import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import * as mime from 'mime-types';

import { canProcess } from '../can-process';

const readImageSource = async (image: string): Promise<Buffer> =>
  fs.readFile(path.join(__dirname, '../../test-utils/bucket', image));

describe('Util: canProcess', () => {
  [
    { name: 'data.json', expected: false },
    { name: 'document.pdf', expected: false },
    { name: 'image-animated.gif', expected: false },
    { name: 'image.gif', expected: true },
    { name: 'image.jpg', expected: true },
    { name: 'image.png', expected: true },
    { name: 'image.svg', expected: true },
  ].forEach(({ name, expected }) => {
    it(`should properly handle ${name}`, async () => {
      const file = await readImageSource(name);
      const contentType = mime.lookup(path.extname(name)) || undefined;

      const result = canProcess(file, { key: name, contentType });
      expect(result).toBe(expected);
    });
  });
});
