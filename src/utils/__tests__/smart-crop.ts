import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { smartCrop } from '../smart-crop';

describe('Util: smartCrop', () => {
  it('should intelligently choose area to extract from image based on expected width and height', async () => {
    const file = await fs.readFile(path.join(__dirname, '../../test-utils/bucket/image.png'));

    const result = await smartCrop(file, { width: 200, height: 200 });
    expect(result).toMatchSnapshot();
  });
});
