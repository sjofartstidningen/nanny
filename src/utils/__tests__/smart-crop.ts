import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { smartCrop } from '../smart-crop';

const readFile = promisify(fs.readFile);

describe('Util: smartCrop', () => {
  it('should intelligently choose area to extract from image based on expected width and height', async () => {
    const file = await readFile(
      path.join(__dirname, '../../../test/bucket/image.png'),
    );

    const result = await smartCrop(file, { width: 200, height: 200 });
    expect(result).toMatchSnapshot();
  });
});
