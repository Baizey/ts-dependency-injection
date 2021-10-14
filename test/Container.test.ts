import 'jest';
import { Alice, Bob, Dummy, Provider } from './models';
import { properties } from '../src/utils';
import { Container, Scoped, Singleton, Transient } from '../src';
import {
  DuplicateDependencyError,
  ExistenceDependencyError,
  MultiDependencyError,
  UnknownDependencyError,
} from '../src/Errors';

class Unknown {}

describe('Add', () => {
  test('No options', () => {
    const sut = new Container(Provider);
    sut.add(Singleton, Alice);
    sut.add(Singleton, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);
    actual?.provide(sut.build());

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('With factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, Alice, { factory });
    sut.add(Scoped, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('With Selector', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, Alice, { factory });
    sut.add(Singleton, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('Error duplicate', () => {
    const sut = new Container(Provider);
    sut.add(Singleton, Alice);

    expect(() => sut.add(Singleton, Alice)).toThrowError(
      new DuplicateDependencyError(properties<Alice, Provider>(new Provider()).alicE),
    );
  });
  test('Error duplicate with selector', () => {
    const sut = new Container(Provider);
    sut.add(Singleton, Alice, { selector: (provider) => provider.alicE });

    expect(() => sut.add(Singleton, Alice, { selector: (provider) => provider.alicE })).toThrowError(
      new DuplicateDependencyError(properties(new Provider()).alicE),
    );
  });
  test('Error unknown', () => {
    const sut = new Container(Provider);
    expect(() => sut.add(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
  });
});

describe('TryAdd', () => {
  test('No options', () => {
    const sut = new Container(Provider);
    sut.add(Singleton, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice);
    const actual = sut.get(properties(new Provider()).alicE);
    actual?.provide(sut.build());

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual).not.toBeUndefined();
  });
  test('with factory', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    const factory = () => expected;
    sut.add(Singleton, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice, { factory });
    const actual = sut.get(properties(new Provider()).alicE);

    expect(actual).toBeInstanceOf(Singleton);
    expect(actual?.provide(sut.build())).toBe(expected);
  });
  test('duplicate', () => {
    const sut = new Container(Provider);
    const expected = new Alice();
    sut.add(Singleton, Bob);
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    sut.tryAdd(Singleton, Alice, { factory: () => expected });
    sut.tryAdd(Singleton, Alice);
    const actual = sut.build().alicE;

    expect(actual).toBe(expected);
  });
  test('error unknown', () => {
    const sut = new Container(Provider);
    expect(() => sut.tryAdd(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
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
    sut.add<Alice>(Singleton, Alice, { factory: () => expectedAlice });
    sut.add<Bob>(Transient, Bob, { factory: () => expectedBob });
    sut.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    const alice = sut.build().alicE;
    const bob = sut.build().boB;

    expect(alice).toBe(expectedAlice);
    expect(bob).toBe(expectedBob);
  });
  test('Error, missing 1 dependency', () => {
    const container = new Container(Provider);
    container.add(Singleton, Bob);
    container.add(Singleton, Dummy, { selector: (provider) => provider.totalWhackYo });

    expect(() => container.build()).toThrowError(new ExistenceDependencyError(properties(new Provider()).alicE));
  });
  test('Error, missing multiple dependencies', () => {
    const container = new Container(Provider);
    expect(() => container.build()).toThrowError(
      new MultiDependencyError([
        new ExistenceDependencyError(properties(new Provider()).alicE),
        new ExistenceDependencyError(properties(new Provider()).boB),
        new ExistenceDependencyError(properties(new Provider()).totalWhackYo),
      ]),
    );
  });
});
