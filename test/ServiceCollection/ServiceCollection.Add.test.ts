import { Scoped, ServiceCollection, ServiceProvider, Singleton, Transient } from '../../src';
import { Alice, BasicTypesProvider, Bob, Dummy, Provider } from '../models';
import { properties } from '../../src/utils';
import { Unknown } from '../models/Unknown';
import { DuplicateDependencyError } from '../../src/Errors/DuplicateDependencyError';
import { UnknownDependencyError } from '../../src/Errors/UnknownDependencyError';
import { InternalServiceProvider } from '../../src/ServiceProvider';

test('No options', () => {
  const sut = new ServiceCollection(Provider);
  sut.add(Singleton, Alice);
  sut.add(Singleton, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  const actual = sut.get(properties(new Provider()).alicE);
  actual?.provide(sut.build());

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual).not.toBeUndefined();
});

test('With factory', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, { factory, selector: (p) => p.alicE });
  sut.add(Scoped, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  const actual = sut.get(properties(new Provider()).alicE);

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual?.provide(sut.build())).toBe(expected);
});

test('With Selector', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, { factory, selector: (p) => p.alicE });
  sut.add(Singleton, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  const actual = sut.get(properties(new Provider()).alicE);

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual?.provide(sut.build())).toBe(expected);
});

test('Error duplicate', () => {
  const sut = new ServiceCollection(Provider);
  sut.add(Singleton, Alice);

  expect(() => sut.add(Singleton, Alice)).toThrowError(new DuplicateDependencyError(properties(new Provider()).alicE));
});

test('Error duplicate with selector', () => {
  const sut = new ServiceCollection(Provider);
  sut.add(Singleton, { dependency: Alice, selector: (provider) => provider.alicE });

  expect(() => sut.add(Singleton, { dependency: Alice, selector: (provider) => provider.alicE })).toThrowError(
    new DuplicateDependencyError(properties(new Provider()).alicE),
  );
});

test('Error unknown', () => {
  const sut = new ServiceCollection(Provider);
  expect(() => sut.add(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
});

test('Basic types', () => {
  const services = new ServiceCollection(BasicTypesProvider);
  services.add(Singleton, { factory: () => 'cake', selector: (p) => p.a });
  services.add(Transient, { factory: () => [1, 2, 3], selector: (p) => p.b });
  services.add(Scoped, { factory: () => [{ a: 1 }], selector: (p) => p.c });
  services.validate();
  expect(true).toBeTruthy();
});

test('addProvider', () => {
  class P {
    provider?: ServiceProvider<P>;
  }

  const services = new ServiceCollection(P);

  services.addProvider();
  const provider = services.build();

  const actual = provider.provider;
  expect(actual).toBeInstanceOf(InternalServiceProvider);
});

test('addProvider', () => {
  class P {
    provider?: ServiceProvider<P>;
  }

  const services = new ServiceCollection(P);

  services.addProvider((p) => p.provider);
  const provider = services.build();

  const actual = provider.provider;
  expect(actual).toBeInstanceOf(InternalServiceProvider);
});

test('addSingleton', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'add');

  services.addSingleton(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Singleton);
});

test('addScoped', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'add');

  services.addScoped(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Scoped);
});

test('addTransient', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'add');

  services.addTransient(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Transient);
});
