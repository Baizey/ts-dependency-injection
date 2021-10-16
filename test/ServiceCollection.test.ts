import 'jest';
import { Alice, BasicTypesProvider, Bob, Dummy, Provider } from './models';
import { properties } from '../src/utils';
import { Scoped, ServiceCollection, Singleton, Transient } from '../src';
import { DuplicateDependencyError, UnknownDependencyError } from '../src/Errors';

class Unknown {}

describe('Add', () => {
  test('No options', () => {
    const sut = new ServiceCollection(Provider);
    sut.add(Singleton, Alice);
    sut.add(Singleton, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);
    actual?.provide(sut.build());

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('With factory', () => {
    const sut = new ServiceCollection(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, { factory, selector: (p) => p.alicE });
    sut.add(Scoped, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('With Selector', () => {
    const sut = new ServiceCollection(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, { factory, selector: (p) => p.alicE });
    sut.add(Singleton, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('Error duplicate', () => {
    const sut = new ServiceCollection(Provider);
    sut.add(Singleton, Alice);

    expect(() => sut.add(Singleton, Alice)).toThrowError(
      new DuplicateDependencyError(properties(new Provider()).alicE),
    );
  });
  test('Error duplicate with selector', () => {
    const sut = new ServiceCollection(Provider);
    sut.add(Singleton, { dependency: Alice, selector: (provider) => provider.alicE });

    expect(() => sut.add(Singleton, { dependency: Alice, selector: (provider) => provider.alicE })).toThrowError(
      new DuplicateDependencyError(properties(new Provider()).alicE),
    );
  });
  test('Error unknown', () => {
    const sut = new ServiceCollection(Provider);
    expect(() => sut.add(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
  });
  test('Basic types', () => {
    const container = new ServiceCollection(BasicTypesProvider);
    container.add(Singleton, { factory: () => 'cake', selector: (p) => p.a });
    container.add(Transient, { factory: () => [1, 2, 3], selector: (p) => p.b });
    container.add(Scoped, { factory: () => [{ a: 1 }], selector: (p) => p.c });
    container.validate();
    expect(true).toBeTruthy();
  });
});

describe('TryAdd', () => {
  test('No options', () => {
    const sut = new ServiceCollection(Provider);
    sut.add(Singleton, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice);
    const actual = sut.get(properties(new Provider()).alicE);
    actual?.provide(sut.build());

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('with factory', () => {
    const sut = new ServiceCollection(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, { factory, selector: (p) => p.alicE });
    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('duplicate', () => {
    const sut = new ServiceCollection(Provider);
    const expected = new Alice();
    sut.add(Singleton, Bob);
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, { factory: () => expected, selector: (p) => p.alicE });
    sut.tryAdd(Singleton, Alice);
    const actual = sut.build().alicE;

    expect(actual).toBe(expected);
  });
  test('error unknown', () => {
    const sut = new ServiceCollection(Provider);
    expect(() => sut.tryAdd(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
  });
});

describe('Remove', () => {
  test('Thing exists', () => {
    const sut = new ServiceCollection(Provider);
    sut.add(Singleton, Alice);

    const actual = sut.remove<Alice>((provider) => provider.alicE);

    expect(actual).toBe(true);
    expect(sut.get((provider) => provider.alicE)).toBeUndefined();
  });
  test('Thing doesnt exists', () => {
    const sut = new ServiceCollection(Provider);

    const actual = sut.remove<Alice>((provider) => provider.alicE);

    expect(actual).toBe(false);
    expect(sut.get((provider) => provider.alicE)).toBeUndefined();
  });
});

describe('Replace', () => {
  test('Thing exists', () => {
    const sut = new ServiceCollection(Provider);
    const alice = new Alice();
    sut.add(Singleton, Alice);

    sut.replace(Singleton, { factory: () => alice, selector: (p) => p.alicE });

    expect(sut.build().alicE).toBe(alice);
  });
  test('Thing doesnt exists', () => {
    const sut = new ServiceCollection(Provider);
    const alice = new Alice();

    sut.replace(Singleton, { factory: () => alice, selector: (p) => p.alicE });

    expect(sut.build().alicE).toBe(alice);
  });
});

describe('alt functions for scope', () => {
  describe('Add', () => {
    test('addSingleton', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'add');

      container.addSingleton(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Singleton);
    });
    test('addScoped', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'add');

      container.addScoped(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Scoped);
    });
    test('addTransient', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'add');

      container.addTransient(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Transient);
    });
  });
  describe('TryAdd', () => {
    test('tryAddSingleton', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'tryAdd');

      container.tryAddSingleton(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Singleton);
    });
    test('tryAddScoped', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'tryAdd');

      container.tryAddScoped(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Scoped);
    });
    test('tryAddTransient', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'tryAdd');

      container.tryAddTransient(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Transient);
    });
  });
  describe('Replace', () => {
    test('replaceSingleton', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'replace');

      container.replaceSingleton(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Singleton);
    });
    test('replaceScoped', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'replace');

      container.replaceScoped(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Scoped);
    });
    test('replaceTransient', () => {
      const container = new ServiceCollection(Provider);
      const spy = jest.spyOn(container, 'replace');

      container.replaceTransient(Alice);

      expect(spy).toBeCalledTimes(1);
      expect(container.get((p) => p.alicE)).toBeInstanceOf(Transient);
    });
  });
});

describe('Build', () => {
  test('Succeed', () => {
    const sut = new ServiceCollection(Provider);
    const expectedAlice = new Alice();
    const expectedBob = new Bob({ alicE: expectedAlice } as Required<Provider>);
    sut.add<Alice>(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
    sut.add<Bob>(Transient, { factory: () => expectedBob, selector: (p) => p.boB });
    sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    const alice = sut.build().alicE;
    const bob = sut.build().boB;

    expect(alice).toBe(expectedAlice);
    expect(bob).toBe(expectedBob);
  });
});
