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
import { CircularDependencyError } from '../../src';
import { SingletonScopedDependencyError } from '../../src';
import { ScopedContext } from '../../src/ServiceProvider/ScopedContext';

test('Invoke', () => {
  const services = new ServiceCollection<Provider>();
  services.add(Scoped, Alice, 'alice');
  services.add(Scoped, Bob, 'bob');
  services.add(Scoped, Dummy, (p) => p.dummy);
  const sut = services.get((p) => p.alice);
  const provider = new ScopedContext<Provider>(services.build().lifetimes);
  const a = sut?.provide(provider);

  expect(a).not.toBeUndefined();
});
test('Lifetime', () => {
  const services = new ServiceCollection<ScopedProvider>();
  services.add(Scoped, ScopedA, (provider) => provider.a);
  services.add(Scoped, ScopedB, (provider) => provider.b);
  services.add(Scoped, ScopedC, (provider) => provider.c);
  const { a, b, c } = services.build().proxy;

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
  const services = new ServiceCollection<CircularProvider>();
  services.add(Scoped, CircularA, 'CircularA');
  services.add(Scoped, CircularB, 'CircularB');
  const sut = services.get((p) => p.CircularA);
  const provider = new ScopedContext<CircularProvider>(services.build().lifetimes);

  expect(() => sut?.provide(provider)).toThrowError(
    new CircularDependencyError('CircularB', ['CircularB', 'CircularA']),
  );
});
test('Singleton depending on Scoped', () => {
  const services = new ServiceCollection<Provider>();
  services.add(Singleton, Bob, (p) => p.bob);
  services.add(Scoped, Alice, (p) => p.alice);
  services.add(Singleton, Dummy, (p) => p.dummy);
  const sut = services.get((p) => p.bob);
  const provider = new ScopedContext<Provider>(services.build().lifetimes);

  expect(() => sut?.provide(provider)).toThrowError(new SingletonScopedDependencyError('bob', 'alice'));
});
