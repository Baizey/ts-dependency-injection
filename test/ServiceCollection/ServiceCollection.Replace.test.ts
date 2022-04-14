import { Scoped, ServiceCollection, Singleton, Transient } from '../../src';
import { Alice, Provider } from '../models';

test('Thing exists', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();
  sut.add(Singleton, Alice, (p) => p.alice);

  sut.replace(Singleton, { factory: () => expected }, (p) => p.alice);

  const actual = sut.build().proxy.alice;
  expect(actual).toBe(expected);
});

test('Thing doesnt exists', () => {
  const sut = new ServiceCollection<Provider>();
  const expected = new Alice();

  sut.replace(Singleton, { factory: () => expected }, (p) => p.alice);

  const actual = sut.build().proxy.alice;
  expect(actual).toBe(expected);
});

test('replaceSingleton', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'replace');

  services.replaceSingleton(Alice, (e) => e.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Singleton);
});

test('replaceScoped', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'replace');

  services.replaceScoped(Alice, (e) => e.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Scoped);
});

test('replaceTransient', () => {
  const services = new ServiceCollection<Provider>();
  const spy = jest.spyOn(services, 'replace');

  services.replaceTransient(Alice, (e) => e.alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alice)).toBeInstanceOf(Transient);
});
