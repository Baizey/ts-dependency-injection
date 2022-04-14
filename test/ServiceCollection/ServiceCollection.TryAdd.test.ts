import { Scoped, ServiceCollection, Singleton, Transient } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';
import { ScopedContext } from '../../src/ServiceProvider/ScopedContext';

test('No options', () => {
  const sut = new ServiceCollection<Provider>();
  sut.add(Singleton, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  sut.tryAdd(Singleton, Alice, (p) => p.alice);

  const actual = sut.get((p) => p.alice);
  expect(actual).toBeInstanceOf(Singleton);

  const instance = actual?.provide(new ScopedContext<Provider>(sut.build().lifetimes));
  expect(instance).toBeInstanceOf(Alice);
});

test('with factory', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  sut.tryAdd(Singleton, { factory }, (p) => p.alice);

  const actual = sut.get((p) => p.alice);
  expect(actual).toBeInstanceOf(Singleton);

  const instance = actual?.provide(new ScopedContext<Provider>(sut.build().lifetimes));
  expect(instance).toBeInstanceOf(Alice);
});

test('duplicate', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();
  sut.add(Singleton, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  sut.tryAdd(Singleton, { factory: () => expected }, (p) => p.alice);
  sut.tryAdd(Singleton, Alice, (p) => p.alice);
  const actual = sut.build().proxy.alice;

  expect(actual).toBe(expected);
});

test('tryAddSingleton', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddSingleton(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Singleton);
});

test('tryAddScoped', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddScoped(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Scoped);
});

test('tryAddTransient', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddTransient(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Transient);
});
