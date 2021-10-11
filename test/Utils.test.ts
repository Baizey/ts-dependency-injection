import 'jest';
import { properties } from '../src/utils';

describe('Utils', () => {
  describe('properties', () => {
    test('basic', () => {
      class Test {
        a: string = null as unknown as string;
        bobcat: string = null as unknown as string;
      }

      const actual = properties(new Test());

      expect(actual).toStrictEqual({
        a: 'a',
        bobcat: 'bobcat',
      });
    });
  });
});
