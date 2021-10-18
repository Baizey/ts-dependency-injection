import 'jest';
import { properties } from '../src/utils';

describe('properties', () => {
  test('basic', () => {
    class Test {
      a?: string;
      bobcat?: string;
    }

    const actual = properties(new Test());

    expect(actual).toStrictEqual({
      a: 'a',
      bobcat: 'bobcat',
    });
  });
});
