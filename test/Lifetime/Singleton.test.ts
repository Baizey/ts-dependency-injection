import 'jest';
import { ServiceCollection, Singleton } from '../../src';
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from '../models';
import { properties } from '../../src/utils';
import { CircularDependencyError } from '../../src/Errors/CircularDependencyError';

test('Invoke', () => {
  const services = new ServiceCollection(Provider);
  services.add(Singleton, Alice);
  services.add(Singleton, Bob);
  services.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.get(properties(new Provider()).alicE);

  const a = sut?.provide(services.build());

  expect(a).not.toBeUndefined();
});
test('Lifetime', () => {
  const services = new ServiceCollection(Provider);
  services.add(Singleton, Alice);
  services.add(Singleton, Bob);
  services.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.get(properties(new Provider()).alicE);

  const a = sut?.provide(services.build());
  const b = sut?.provide(services.build());

  expect(a).not.toBeUndefined();
  expect(b).not.toBeUndefined();
  expect(a).toBe(b);
});
test('Circular dependency', () => {
  const services = new ServiceCollection(CircularProvider);
  services.add(Singleton, CircularA);
  services.add(Singleton, CircularB);
  const sut = services.get(properties(new CircularProvider()).CircularA);

  expect(() => sut?.provide(services.build())).toThrowError(new CircularDependencyError('CircularB', 'CircularA'));
});
