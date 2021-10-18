import { Scoped, ServiceCollection, Singleton, Transient } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';
import { properties } from '../../src/utils';
import { Unknown } from '../models/Unknown';
import { UnknownDependencyError } from '../../src/Errors/UnknownDependencyError';

test('No options', () => {
  const sut = new ServiceCollection(Provider);
  sut.add(Singleton, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  sut.tryAdd(Singleton, Alice);
  const actual = sut.get(properties(new Provider()).alicE);
  actual?.provide(sut.build());

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual).not.toBeUndefined();
});

test('with factory', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();
  const factory = () => expected;
  sut.add(Singleton, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  sut.tryAdd(Singleton, { factory, selector: (p) => p.alicE });
  const actual = sut.get(properties(new Provider()).alicE);

  expect(actual).toBeInstanceOf(Singleton);
  expect(actual?.provide(sut.build())).toBe(expected);
});

test('duplicate', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();
  sut.add(Singleton, Bob);
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  sut.tryAdd(Singleton, { factory: () => expected, selector: (p) => p.alicE });
  sut.tryAdd(Singleton, Alice);
  const actual = sut.build().alicE;

  expect(actual).toBe(expected);
});

test('error unknown', () => {
  const sut = new ServiceCollection(Provider);
  expect(() => sut.tryAdd(Singleton, Unknown)).toThrowError(new UnknownDependencyError(Unknown.name));
});

test('tryAddSingleton', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddSingleton(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Singleton);
});

test('tryAddScoped', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddScoped(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Scoped);
});

test('tryAddTransient', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'tryAdd');

  services.tryAddTransient(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Transient);
});
