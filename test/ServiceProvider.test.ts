import 'jest';
import { Scoped, ServiceCollection, Singleton } from '../src';
import {
  Alice,
  Bob,
  CircularA,
  CircularB,
  CircularProvider,
  Dummy,
  Provider,
  ScopedA,
  ScopedB,
  ScopedC,
  ScopedProvider,
} from './models';
import {
  CircularDependencyError,
  ExistenceDependencyError,
  MultiDependencyError,
  SingletonScopedDependencyError,
} from '../src/Errors';

describe('Get', () => {
  test('Succeed, via get property', () => {
    const container = new ServiceCollection(Provider);
    const expectedAlice = new Alice();
    container.add(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.alicE;

    expect(alice).toBe(expectedAlice);
  });
  test('Succeed, via classname', () => {
    const container = new ServiceCollection(Provider);
    const expectedAlice = new Alice();
    container.add(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.getService((provider) => provider.alicE);

    expect(alice).toBe(expectedAlice);
  });
  test('Error, circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Singleton, CircularA);
    container.add(Singleton, CircularB);
    const sut = container.build(true);
    expect(() => sut.CircularA).toThrowError(new CircularDependencyError('CircularA', 'CircularB'));
  });
});

describe('Validate', () => {
  test('Succeed', () => {
    const container = new ServiceCollection(Provider);
    container.add(Singleton, Alice);
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    container.validate();

    expect(true).toBeTruthy();
  });
  test('Error, circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Singleton, CircularA);
    container.add(Singleton, CircularB);

    expect(() => container.validate()).toThrowError(
      new MultiDependencyError([
        new CircularDependencyError('CircularA', 'CircularB'),
        new CircularDependencyError('CircularB', 'CircularA'),
      ]),
    );
  });
  test('Error, Scoped-Singleton dependency', () => {
    const container = new ServiceCollection(ScopedProvider);
    container.add(Scoped, { dependency: ScopedA, selector: (p) => p.a });
    container.add(Scoped, { dependency: ScopedB, selector: (p) => p.b });
    container.add(Singleton, { dependency: ScopedC, selector: (p) => p.c });

    expect(() => container.validate()).toThrowError(
      new MultiDependencyError([new SingletonScopedDependencyError('c', 'b')]),
    );
  });
  test('Error, Scoped-Singleton dependency', () => {
    const container = new ServiceCollection(ScopedProvider);
    expect(() => container.validate()).toThrowError(
      new MultiDependencyError([
        new ExistenceDependencyError('a'),
        new ExistenceDependencyError('b'),
        new ExistenceDependencyError('c'),
      ]),
    );
  });
});
