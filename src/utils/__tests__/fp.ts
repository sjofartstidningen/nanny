import { allPass, anyPass, capitalize, clamp, isEmpty } from '../fp';

const isNumber = (x: any) => typeof x === 'number';

describe('util: fp.allPass', () => {
  it('should evaluate every val in the array and see if all pass the predicate', () => {
    expect(allPass((x: any) => true, [1, 2, 3, 4])).toBeTruthy();
    expect(allPass((x: any) => false, [1, 2, 3, 4])).toBeFalsy();
    expect(allPass(isNumber, [1, 2, 3, 4])).toBeTruthy();
    expect(allPass(isNumber, [1, 2, 3, 'string'])).toBeFalsy();
  });

  it('should return early as soon as a false value is found', () => {
    const predicate = jest.fn(isNumber);
    allPass(predicate, ['1', 2, 3, 4]);
    expect(predicate).toHaveBeenCalledTimes(1);
  });
});

describe('util: fp.anyPass', () => {
  it('should evaluate every val in the array and see if all pass the predicate', () => {
    expect(anyPass((x: any) => true, [1, 2, 3, 4])).toBeTruthy();
    expect(anyPass((x: any) => false, [1, 2, 3, 4])).toBeFalsy();
    expect(anyPass(isNumber, ['1', '2', '3', '4'])).toBeFalsy();
    expect(anyPass(isNumber, ['1', '2', '3', 4])).toBeTruthy();
  });

  it('should return early as soon as a true value is found', () => {
    const predicate = jest.fn(isNumber);
    anyPass(predicate, ['1', 2, '3', '4']);
    expect(predicate).toHaveBeenCalledTimes(2);
  });
});

describe('util: fp.capitalize', () => {
  it('should capitalize every word in a string', () => {
    expect(capitalize('foo')).toEqual('Foo');
    expect(capitalize('hello world')).toEqual('Hello World');
    expect(capitalize('content-type')).toEqual('Content-Type');
  });
});

describe('util: fp.clamp', () => {
  it('should clamp a value between min and max', () => {
    expect(clamp(5, 0, 10)).toEqual(5);
    expect(clamp(11, 0, 10)).toEqual(10);
    expect(clamp(-1, 0, 10)).toEqual(0);
  });
});

describe('util: fp.isEmpty', () => {
  it('should determine if an object is empty or not', () => {
    expect(isEmpty({})).toBeTruthy();
    expect(isEmpty([])).toBeTruthy();
    expect(isEmpty({ a: 1 })).toBeFalsy();

    class Bar {
      public static b: number = 2;
      public a: number = 1;
    }
    expect(isEmpty(new Bar())).toBeFalsy();
    expect(isEmpty(Bar)).toBeFalsy();

    class Foo {
      public fn() {
        return 0;
      }
    }
    expect(isEmpty(new Foo())).toBeTruthy();
  });
});
