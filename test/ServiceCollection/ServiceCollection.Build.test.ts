import { ServiceCollection, Singleton, Transient } from '../../src'
import { Alice, Bob, Dummy, Provider } from '../models'

test('Succeed', () => {
	const sut = new ServiceCollection<Provider>()
	const expectedAlice = new Alice()
	const expectedBob = new Bob({ alice: expectedAlice } as Required<Provider>)
	sut.add<Alice>(Singleton, { factory: () => expectedAlice }, (p) => p.alice)
	sut.add<Bob>(Transient, { factory: () => expectedBob }, (p) => p.bob)
	sut.add(Singleton, Dummy, (provider) => provider.dummy)
	
	const alice = sut.build().proxy.alice
	const bob = sut.build().proxy.bob
	
	expect(alice).toBe(expectedAlice)
	expect(bob).toBe(expectedBob)
})