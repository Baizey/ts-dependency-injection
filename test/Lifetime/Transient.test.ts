import 'jest';
import { CircularDependencyError, ScopedContext, ServiceCollection, Transient } from '../../src';
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from '../models';

function setup() {
  const services = new ServiceCollection<Provider>();
  services.add(Transient, Alice, (p) => p.alice);
  services.add(Transient, Bob, (p) => p.bob);
  services.add(Transient, Dummy, (provider) => provider.dummy);
  return { services, context: new ScopedContext<Provider>(services.build().lifetimes) };
}

test('Invoke', () => {
  const { services, context } = setup();
  const sut = services.get((p) => p.alice);

  const a = sut?.provide(context);

  expect(a).not.toBeUndefined();
});
test('Lifetime', () => {
  const { services, context } = setup();
  const sut = services.get((p) => p.alice);

  const a = sut?.provide(context);
  const b = sut?.provide(context);

  expect(a).not.toBeUndefined();
  expect(b).not.toBeUndefined();
  expect(a).not.toBe(b);
});
test('Circular dependency', () => {
  const services = new ServiceCollection<CircularProvider>();
  services.add(Transient, CircularA, 'CircularA');
  services.add(Transient, CircularB, 'CircularB');
  const sut = services.get('CircularA');

  const context = new ScopedContext<CircularProvider>(services.build().lifetimes);

  expect(() => sut?.provide(context)).toThrowError(
    new CircularDependencyError('CircularB', ['CircularB', 'CircularA']),
  );
});
