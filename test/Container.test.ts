import 'jest';
import { Container, DependencyError, DependencyErrorType, Singleton, Transient } from '../src';
import { Alice, Bob, Dummy, Provider } from './models';
import { DependencyMultiError, DependencyMultiErrorType } from '../src/DependencyError';

class Unknown {}

describe('Add', () => {
  describe('Manual', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.add(Singleton, Alice);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      const actual = sut.get(Alice);
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
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      const actual = sut.get(Alice);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.add(Singleton, Alice);

      expect(() => sut.add(Singleton, Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: Alice,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.add(Singleton, Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown,
        }),
      );
    });
  });

  describe('Singleton', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      sut.addSingleton(Alice);
      const actual = sut.get(Alice);
      actual?.provide();

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual).not.toBeUndefined();
    });
    test('With factory', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      sut.addSingleton(Alice, { factory });
      const actual = sut.get(Alice);

      expect(actual).toBeInstanceOf(Singleton);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Alice);

      expect(() => sut.addSingleton(Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: Alice,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.addSingleton(Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown,
        }),
      );
    });
  });

  describe('Transient', () => {
    test('No options', () => {
      const sut = new Container(Provider);
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      sut.addTransient(Alice);
      const actual = sut.get(Alice);
      actual?.provide();

      expect(actual).toBeInstanceOf(Transient);
      expect(actual).not.toBeUndefined();
    });
    test('With factory', () => {
      const sut = new Container(Provider);
      const expected = new Alice();
      const factory = () => expected;
      sut.addSingleton(Bob);
      sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

      sut.addTransient(Alice, { factory });
      const actual = sut.get(Alice);

      expect(actual).toBeInstanceOf(Transient);
      expect(actual?.provide()).toBe(expected);
    });
    test('Error duplicate', () => {
      const sut = new Container(Provider);
      sut.addTransient(Alice);

      expect(() => sut.addTransient(Alice)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Duplicate,
          lifetime: Alice,
        }),
      );
    });
    test('Error unknown', () => {
      const sut = new Container(Provider);
      expect(() => sut.addTransient(Unknown)).toThrowError(
        new DependencyError({
          type: DependencyErrorType.Unknown,
          lifetime: Unknown,
        }),
      );
    });
  });
});

describe('TryAdd', () => {
  test('Manual', () => {
    const sut = new Container(Provider);
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice);
    const actual = sut.get(Alice);
    actual?.provide();

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('Manual with factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice, { factory });
    const actual = sut.get(Alice);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide()).toBe(expected);
  });
  test('Manual duplicate', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

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
        lifetime: Unknown,
      }),
    );
  });

  test('Singleton', () => {
    const sut = new Container(Provider);
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAddSingleton(Alice);
    const actual = sut.get(Alice);
    actual?.provide();

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('Singleton with factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAddSingleton(Alice, { factory });
    const actual = sut.get(Alice);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide()).toBe(expected);
  });
  test('Singleton duplicate', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAddSingleton(Alice, { factory: () => expected });
    sut.tryAddSingleton(Alice);
    const actual = sut.build().alicE;

    expect(actual).toBe(expected);
  });
  test('Singleton, error unknown', () => {
    const sut = new Container(Provider);
    expect(() => sut.tryAddSingleton(Unknown)).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Unknown,
        lifetime: Unknown,
      }),
    );
  });

  test('Transient', () => {
    const sut = new Container(Provider);
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAddTransient(Alice);
    const actual = sut.get(Alice);
    actual?.provide();

    expect(actual).toBeInstanceOf(Transient);
    expect(actual).not.toBeUndefined();
  });
  test('Transient with factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    sut.tryAddTransient(Alice, { factory });
    const actual = sut.get(Alice);

    expect(actual).toBeInstanceOf(Transient);
    expect(actual?.provide()).toBe(expected);
  });
  test('Transient duplicate', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    sut.addSingleton(Bob);
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    sut.tryAddTransient(Alice, { factory: () => expected });

    sut.tryAddTransient(Alice);
    const actual = sut.build().alicE;

    expect(actual).toBe(expected);
  });
  test('Transient, error unknown', () => {
    const sut = new Container(Provider);
    expect(() => sut.tryAddTransient(Unknown)).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Unknown,
        lifetime: Unknown,
      }),
    );
  });
});

describe('Build', () => {
  test('Succeed', () => {
    const sut = new Container(Provider);
    const expectedAlice = new Alice();
    const expectedBob = new Bob({ alicE: expectedAlice } as Provider);
    sut.addSingleton<Alice>(Alice, { factory: () => expectedAlice });
    sut.addTransient<Bob>(Bob, { factory: () => expectedBob });
    sut.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    const alice = sut.build().alicE;
    const bob = sut.build().boB;

    expect(alice).toBe(expectedAlice);
    expect(bob).toBe(expectedBob);
  });

  test('Error, missing 1 dependency', () => {
    const container = new Container(Provider);
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });

    expect(() => container.build()).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Existence,
        lifetime: Alice,
      }),
    );
  });

  test('Error, missing multiple dependencies', () => {
    const container = new Container(Provider);
    expect(() => container.build()).toThrowError(
      new DependencyMultiError(DependencyMultiErrorType.Build, [
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: Alice }),
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: Bob }),
        new DependencyError({ type: DependencyErrorType.Existence, lifetime: 'totalwhackyo' }),
      ]),
    );
  });
});
