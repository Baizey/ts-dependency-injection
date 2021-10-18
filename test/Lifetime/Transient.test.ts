import 'jest';
import { ServiceCollection, Transient } from '../../src';
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from '../models';
import { properties } from '../../src/utils';
import { CircularDependencyError } from '../../src/Errors/CircularDependencyError';

test('Invoke', () => {
  const services = new ServiceCollection(Provider);
  services.add(Transient, Alice);
  services.add(Transient, Bob);
  services.add(Transient, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.get(properties(new Provider()).alicE);

  const a = sut?.provide(services.build());

  expect(a).not.toBeUndefined();
});
test('Lifetime', () => {
  const services = new ServiceCollection(Provider);
  services.add(Transient, Alice);
  services.add(Transient, Bob);
  services.add(Transient, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.get(properties(new Provider()).alicE);

  const a = sut?.provide(services.build());
  const b = sut?.provide(services.build());

  expect(a).not.toBeUndefined();
  expect(b).not.toBeUndefined();
  expect(a).not.toBe(b);
});
test('Circular dependency', () => {
  const services = new ServiceCollection(CircularProvider);
  services.add(Transient, CircularA);
  services.add(Transient, CircularB);
  const sut = services.get(properties(new CircularProvider()).CircularA);

  expect(() => sut?.provide(services.build())).toThrowError(new CircularDependencyError('CircularB', 'CircularA'));
});
