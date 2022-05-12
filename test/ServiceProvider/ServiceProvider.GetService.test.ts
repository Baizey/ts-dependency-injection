import 'jest'
import { ServiceCollection, Singleton } from '../../src'
import { Alice, Bob, Dummy, Provider } from '../models'

function setup() {
	const services = new ServiceCollection<Provider>()
	const expectedAlice = new Alice()
	services.add(Singleton, { factory: () => expectedAlice }, (p) => p.alice)
	services.add(Singleton, Bob, (p) => p.bob)
	services.add(Singleton, Dummy, (provider) => provider.dummy)
	return { sut: services.build(), expected: expectedAlice }
}

test('Succeed with name selector', () => {
	const { sut, expected } = setup()
	const alice = sut.provide((p) => p.alice)
	expect(alice).toBe(expected)
})
test('Succeed with string', () => {
	const { sut, expected } = setup()
	
	const alice = sut.provide('alice')
	
	expect(alice).toBe(expected)
})
test('Succeed with proxy', () => {
	const { sut, expected } = setup()
	
	const alice = sut.proxy.alice
	
	expect(alice).toBe(expected)
})