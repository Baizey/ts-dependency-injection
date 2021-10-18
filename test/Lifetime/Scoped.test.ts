import 'jest';
import { Scoped, ServiceCollection, Singleton } from '../../src';
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
} from '../models';
import { properties } from '../../src/utils';
import { CircularDependencyError } from '../../src/Errors/CircularDependencyError';
import { SingletonScopedDependencyError } from '../../src/Errors/SingletonScopedDependencyError';

test('Invoke', () => {
  const services = new ServiceCollection(Provider);
  services.add(Scoped, Alice);
  services.add(Scoped, Bob);
  services.add(Scoped, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.get(properties(new Provider()).alicE);
  const provider = services.build();
  provider._.scope = {};

  const a = sut?.provide(provider);

  expect(a).not.toBeUndefined();
});
test('Lifetime', () => {
  const services = new ServiceCollection(ScopedProvider);
  services.add(Scoped, { dependency: ScopedA, selector: (provider) => provider.a });
  services.add(Scoped, { dependency: ScopedB, selector: (provider) => provider.b });
  services.add(Scoped, { dependency: ScopedC, selector: (provider) => provider.c });
  const { a, b, c } = services.build();

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
  const services = new ServiceCollection(CircularProvider);
  services.add(Scoped, CircularA);
  services.add(Scoped, CircularB);
  const sut = services.get(properties(new CircularProvider()).CircularA);
  const provider = services.build();
  provider._.scope = {};

  expect(() => sut?.provide(provider)).toThrowError(new CircularDependencyError('CircularA', 'CircularB'));
});
test('Singleton depending on Scoped', () => {
  const services = new ServiceCollection(Provider);
  services.add(Singleton, Bob);
  services.add(Scoped, Alice);
  services.add(Singleton, { dependency: Dummy, selector: (p) => p.totalWhackYo });
  const sut = services.get(properties(new Provider()).boB);
  const provider = services.build();
  provider._.scope = {};

  expect(() => sut?.provide(provider)).toThrowError(new SingletonScopedDependencyError('boB', 'alicE'));
});
