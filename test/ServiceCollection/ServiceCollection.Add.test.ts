import { ServiceCollection, Scoped, Singleton, Transient, ScopedContext, DuplicateDependencyError } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';

test('No options', () => {
  const sut = new ServiceCollection<Provider>();
  sut.add(Singleton, Alice, (p) => p.alice);
  sut.add(Singleton, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  const actual = sut.get((p) => p.alice);
  actual?.provide(new ScopedContext<Provider>(sut.build().lifetimes));

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual).not.toBeUndefined();
});

test('With factory', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, { factory }, (p) => p.alice);
  sut.add(Scoped, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  const actual = sut.get((p) => p.alice);

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual?.provide(new ScopedContext<Provider>(sut.build().lifetimes))).toBe(expected);
});

test('With Selector', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, { factory }, (p) => p.alice);
  sut.add(Singleton, Bob, (p) => p.bob);
  sut.add(Singleton, Dummy, (provider) => provider.dummy);

  const actual = sut.get((p) => p.alice);

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual?.provide(new ScopedContext<Provider>(sut.build().lifetimes))).toBe(expected);
});

test('Error duplicate', () => {
  const sut = new ServiceCollection<Provider>();
  sut.add(Singleton, Alice, (p) => p.alice);

  expect(() => sut.add(Singleton, Alice, (p) => p.alice)).toThrowError(new DuplicateDependencyError('alice'));
});

test('Error duplicate with selector', () => {
  const sut = new ServiceCollection<Provider>();
  sut.add(Singleton, Alice, (provider) => provider.alice);

  expect(() => sut.add(Singleton, Alice, (provider) => provider.alice)).toThrowError(
    new DuplicateDependencyError('alice'),
  );
});

test('addSingleton', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'add');

  services.addSingleton(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Singleton);
});

test('addScoped', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'add');

  services.addScoped(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Scoped);
});

test('addTransient', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'add');

  services.addTransient(Alice, (p) => p.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Transient);
});
