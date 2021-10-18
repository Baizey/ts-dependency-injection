import { ServiceCollection, Singleton, Transient } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';

test('Succeed', () => {
  const sut = new ServiceCollection(Provider);
  const expectedAlice = new Alice();
  const expectedBob = new Bob({ alicE: expectedAlice } as Required<Provider>);
  sut.add<Alice>(Singleton, { factory: () => expectedAlice, selector: (p) => p.alicE });
  sut.add<Bob>(Transient, { factory: () => expectedBob, selector: (p) => p.boB });
  sut.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  const alice = sut.build().alicE;
  const bob = sut.build().boB;

  expect(alice).toBe(expectedAlice);
  expect(bob).toBe(expectedBob);
});
