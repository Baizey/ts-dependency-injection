import { Scoped, ServiceCollection, Singleton, Transient } from '../../src';
import { Alice, Provider } from '../models';

test('Thing exists', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();
  sut.add(Singleton, Alice);

  sut.replace(Singleton, { factory: () => expected, selector: (p) => p.alicE });

  const actual = sut.build().alicE;
  expect(actual).toBe(expected);
});

test('Thing doesnt exists', () => {
  const sut = new ServiceCollection(Provider);
  const expected = new Alice();

  sut.replace(Singleton, { factory: () => expected, selector: (p) => p.alicE });

  const actual = sut.build().alicE;
  expect(actual).toBe(expected);
});

test('replaceSingleton', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'replace');

  services.replaceSingleton(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Singleton);
});

test('replaceScoped', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'replace');

  services.replaceScoped(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Scoped);
});

test('replaceTransient', () => {
  const services = new ServiceCollection(Provider);
  const spy = jest.spyOn(services, 'replace');

  services.replaceTransient(Alice);

  expect(spy).toBeCalledTimes(1);
  expect(services.get((p) => p.alicE)).toBeInstanceOf(Transient);
});
