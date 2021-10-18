import 'jest';
import { ServiceCollection, Singleton } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';

test('Succeed with name selector', () => {
  const services = new ServiceCollection(Provider);
  const expectedAlice = new Alice();
  services.add(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
  services.add(Singleton, Bob);
  services.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.build();

  const alice = sut.getService((p) => p.alicE);

  expect(alice).toBe(expectedAlice);
});
test('Succeed with string', () => {
  const services = new ServiceCollection(Provider);
  const expectedAlice = new Alice();
  services.add(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
  services.add(Singleton, Bob);
  services.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
  const sut = services.build();

  const alice = sut.getService('alicE');

  expect(alice).toBe(expectedAlice);
});
