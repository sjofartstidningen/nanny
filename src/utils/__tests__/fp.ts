import { allPass } from '../fp';

const isNumber = (x: any) => typeof x === 'number';

describe('util: fp.allPass', () => {
  it('should evaluate every val in the array and see if all pass the predicate', () => {
    expect(allPass((x: any) => true, [1, 2, 3, 4])).toBeTruthy();
    expect(allPass((x: any) => false, [1, 2, 3, 4])).toBeFalsy();
    expect(allPass(isNumber, [1, 2, 3, 4])).toBeTruthy();
    expect(allPass(isNumber, [1, 2, 3, 'string'])).toBeFalsy();
  });

  it('should bail early as soon as a false value is found', () => {
    const predicate = jest.fn(isNumber);
    allPass(predicate, ['1', 2, 3, 4]);
    expect(predicate).toHaveBeenCalledTimes(1);
  });
});
