﻿import 'jest';
import { ServiceCollection, Scoped, Singleton, Transient } from '../src';
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
import { properties } from '../src/utils';
import { CircularDependencyError, SingletonScopedDependencyError } from '../src/Errors';

describe('Singleton', () => {
  test('Invoke', () => {
    const container = new ServiceCollection(Provider);
    container.add(Singleton, Alice);
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.get(properties(new Provider()).alicE);

    const a = sut?.provide(container.build());

    expect(a).not.toBeUndefined();
  });
  test('Lifetime', () => {
    const container = new ServiceCollection(Provider);
    container.add(Singleton, Alice);
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.get(properties(new Provider()).alicE);

    const a = sut?.provide(container.build());
    const b = sut?.provide(container.build());

    expect(a).not.toBeUndefined();
    expect(b).not.toBeUndefined();
    expect(a).toBe(b);
  });
  test('Circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Singleton, CircularA);
    container.add(Singleton, CircularB);
    const sut = container.get(properties(new CircularProvider()).CircularA);

    expect(() => sut?.provide(container.build(true))).toThrowError(
      new CircularDependencyError('CircularA', 'CircularB'),
    );
  });
});

describe('Transient', () => {
  test('Invoke', () => {
    const container = new ServiceCollection(Provider);
    container.add(Transient, Alice);
    container.add(Transient, Bob);
    container.add(Transient, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.get(properties(new Provider()).alicE);

    const a = sut?.provide(container.build());

    expect(a).not.toBeUndefined();
  });
  test('Lifetime', () => {
    const container = new ServiceCollection(Provider);
    container.add(Transient, Alice);
    container.add(Transient, Bob);
    container.add(Transient, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.get(properties(new Provider()).alicE);

    const a = sut?.provide(container.build());
    const b = sut?.provide(container.build());

    expect(a).not.toBeUndefined();
    expect(b).not.toBeUndefined();
    expect(a).not.toBe(b);
  });
  test('Circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Transient, CircularA);
    container.add(Transient, CircularB);
    const sut = container.get(properties(new CircularProvider()).CircularA);

    expect(() => sut?.provide(container.build(true))).toThrowError(
      new CircularDependencyError('CircularA', 'CircularB'),
    );
  });
});

describe('Scoped', () => {
  test('Invoke', () => {
    const container = new ServiceCollection(Provider);
    container.add(Scoped, Alice);
    container.add(Scoped, Bob);
    container.add(Scoped, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.get(properties(new Provider()).alicE);
    const provider = container.build();
    provider._.scope = {};

    const a = sut?.provide(provider);

    expect(a).not.toBeUndefined();
  });
  test('Lifetime', () => {
    const container = new ServiceCollection(ScopedProvider);
    container.add(Scoped, { dependency: ScopedA, selector: (provider) => provider.a });
    container.add(Scoped, { dependency: ScopedB, selector: (provider) => provider.b });
    container.add(Scoped, { dependency: ScopedC, selector: (provider) => provider.c });
    const { a, b, c } = container.build();

    // a should be its own context
    expect(a).not.toBe(b.a);
    expect(a).not.toBe(c.b.a);
    expect(a).not.toBe(c.a);

    // b should be its own context
    expect(b).not.toBe(c.b);

    // c.a and c.b.a should be within same context
    expect(c.a).toBe(c.b.a);
  });
  test('Circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Scoped, CircularA);
    container.add(Scoped, CircularB);
    const sut = container.get(properties(new CircularProvider()).CircularA);
    const provider = container.build(true);
    provider._.scope = {};

    expect(() => sut?.provide(provider)).toThrowError(new CircularDependencyError('CircularA', 'CircularB'));
  });
  test('Singleton depending on Scoped', () => {
    const container = new ServiceCollection(Provider);
    container.add(Singleton, Bob);
    container.add(Scoped, Alice);
    container.add(Singleton, { dependency: Dummy, selector: (p) => p.totalWhackYo });
    const sut = container.get(properties(new Provider()).boB);
    const provider = container.build(true);
    provider._.scope = {};

    expect(() => sut?.provide(provider)).toThrowError(new SingletonScopedDependencyError('boB', 'alicE'));
  });
});
