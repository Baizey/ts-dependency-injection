import { ServiceCollection, Singleton } from '../../src';
import { Alice, Provider } from '../models';

test('Thing exists', () => {
  const sut = new ServiceCollection(Provider);
  sut.add(Singleton, Alice);

  const actual = sut.remove<Alice>((provider) => provider.alicE);

  expect(actual).toBe(true);
  expect(sut.get((provider) => provider.alicE)).toBeUndefined();
});

test('Thing doesnt exists', () => {
  const sut = new ServiceCollection(Provider);

  const actual = sut.remove<Alice>((provider) => provider.alicE);

  expect(actual).toBe(false);
  expect(sut.get((provider) => provider.alicE)).toBeUndefined();
});
