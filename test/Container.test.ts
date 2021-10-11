import 'jest';
import { Container, DependencyError, DependencyMultiError, Singleton, Transient } from '../src';
import { Alice, Bob, Dummy, Provider } from './models';
import { properties } from '../src/utils';
import { DependencyErrorType, DependencyMultiErrorType } from '../src/types';

class Unknown {}

describe('Add', () => {
  describe('Manual', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.add(Singleton, Alice);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      const actual = sut.get(properties(new Provider()).alicE);
      actual?.provide();

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual).not.toBeUndefined();
    });
    test('With factory', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.add(Singleton, Alice, { factory });
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      const actual = sut.get(properties(new Provider()).alicE);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('With Selector', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.add(Singleton, Alice, { factory });
      sut.addSingleton(Bob);
      sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

      const actual = sut.get(properties(new Provider()).alicE);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.add(Singleton, Alice);

      expect(() => sut.add(Singleton, Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: properties<Alice, Provider>(new Provider()).alicE,
        }),
      );
    });
    test('Error duplicate with selector', () => {
      const sut = new Container(Provider);
      sut.add(Singleton, Alice, { selector: (provider) => provider.alicE });

      expect(() => sut.add(Singleton, Alice, { selector: (provider) => provider.alicE })).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: properties(new Provider()).alicE,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.add(Singleton, Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown.name,
        }),
      );
    });
  });
  describe('Singleton', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      sut.addSingleton(Alice);
      const actual = sut.get(properties(new Provider()).alicE);
      actual?.provide();

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual).not.toBeUndefined();
    });
    test('With factory', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      sut.addSingleton(Alice, { factory });
      const actual = sut.get(properties(new Provider()).alicE);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('With Selector', () => {
      const sut = new Container(Provider);
      const expected = new Dummy();
      const factory = () => expected;
      sut.addSingleton(Alice);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { factory, selector: (provider) => provider.totalWhackYo });

      const actual = sut.get(properties(new Provider()).totalWhackYo);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Alice);

      expect(() => sut.addSingleton(Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: properties(new Provider()).alicE,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.addSingleton(Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown.name,
        }),
      );
    });
  });
  describe('Transient', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      sut.addTransient(Alice);
      const actual = sut.get(properties(new Provider()).alicE);
      actual?.provide();

      expect(actual).toBeInstanceOf(Transient);
      expect(actual).not.toBeUndefined();
    });
    test('With factory', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

      sut.addTransient(Alice, { factory });
      const actual = sut.get(properties(new Provider()).alicE);

      expect(actual).toBeInstanceOf(Transient);
      expect(actual?.provide()).toBe(expected);
    });
    test('With Selector', () => {
      const sut = new Container(Provider);
      const expected = new Dummy();
      const factory = () => expected;
      sut.addSingleton(Alice);
      sut.addSingleton(Bob);
      sut.addTransient(Dummy, { factory, selector: (provider) => provider.totalWhackYo });

      const actual = sut.get(properties(new Provider()).totalWhackYo);

      expect(actual).toBeInstanceOf(Transient);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.addTransient(Alice);

      expect(() => sut.addTransient(Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: properties(new Provider()).alicE,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.addTransient(Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown.name,
        }),
      );
    });
  });
});

describe('TryAdd', () => {
  test('Manual', () => {
    const sut = new Container(Provider);
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice);
    const actual = sut.get(properties(new Provider()).alicE);
    actual?.provide();

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('Manual with factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice, { factory });
    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide()).toBe(expected);
  });
  test('Manual duplicate', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice, { factory: () => expected });
    sut.tryAdd(Singleton, Alice);
    const actual = sut.build().alicE;

    expect(actual).toBe(expected);
  });
  test('Manual, error unknown', () => {
    const sut = new Container(Provider);
    expect(() => sut.tryAdd(Singleton, Unknown)).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Unknown,
        lifetime: Unknown.name,
      }),
    );
  });
});

describe('Remove', () => {
  test('Thing exists', () => {
    const sut = new Container(Provider);
    sut.add(Singleton, Alice);

    const actual = sut.remove<Alice>((provider) => provider.alicE);

    expect(actual).toBe(true);
    expect(sut.get((provider) => provider.alicE)).toBeUndefined();
  });
  test('Thing doesnt exists', () => {
    const sut = new Container(Provider);

    const actual = sut.remove<Alice>((provider) => provider.alicE);

    expect(actual).toBe(false);
    expect(sut.get((provider) => provider.alicE)).toBeUndefined();
  });
});

describe('Build', () => {
  test('Succeed', () => {
    const sut = new Container(Provider);
    const expectedAlice = new Alice();
    const expectedBob = new Bob({ alicE: expectedAlice } as Provider);
    sut.addSingleton<Alice>(Alice, { factory: () => expectedAlice });
    sut.addTransient<Bob>(Bob, { factory: () => expectedBob });
    sut.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

    const alice = sut.build().alicE;
    const bob = sut.build().boB;

    expect(alice).toBe(expectedAlice);
    expect(bob).toBe(expectedBob);
  });

  test('Error, missing 1 dependency', () => {
    const container = new Container(Provider);
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });

    expect(() => container.build()).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Existence,
        lifetime: properties(new Provider()).alicE,
      }),
    );
  });

  test('Error, missing multiple dependencies', () => {
    const container = new Container(Provider);
    expect(() => container.build()).toThrowError(
      new DependencyMultiError(DependencyMultiErrorType.Build, [
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: properties(new Provider()).alicE }),
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: properties(new Provider()).boB }),
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: 'totalwhackyo' }),
      ]),
    );
  });
});
