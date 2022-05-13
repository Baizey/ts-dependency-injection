import { ShouldBeMockedDependencyError } from '../../src'
import { dummy, UUID } from '../testUtils'

describe('mock', () => {
	test('Root is normal, dependencies are mocked', () => {
		const { bob, alice } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(alice.id).toBeTruthy()
		expect(() => bob.alice.id).toThrowError(new ShouldBeMockedDependencyError('alice', 'id', 'get'))
	})
	
	test('Mock function, succeed', () => {
		const mock = { func: () => UUID.randomUUID() }
		const spy = jest.spyOn(mock, 'func')
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock({ alice: mock })
		
		expect(bob.alice.func()).toBeTruthy()
		expect(spy).toBeCalledTimes(1)
	})
	
	test('Forget mock function, throw error', () => {
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(() => bob.alice.func()).toThrowError(new ShouldBeMockedDependencyError('alice', 'func', 'get'))
	})
	
	test('Mock get, succeed', () => {
		const mock = { get getter() { return UUID.randomUUID() } }
		const spy = jest.spyOn(mock, 'getter', 'get')
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock({ alice: mock })
		
		expect(bob.alice.getter).toBeTruthy()
		expect(spy).toBeCalledTimes(1)
	})
	
	test('Forget mock get, throw error', () => {
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(() => bob.alice.getter).toThrowError(new ShouldBeMockedDependencyError('alice', 'getter', 'get'))
	})
	
	test('Mock set, succeed setting', () => {
		// noinspection JSUnusedLocalSymbols
		const mock = { set setter(v: any) { } }
		const spy = jest.spyOn(mock, 'setter', 'set')
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock({ alice: mock })
		
		bob.alice.setter = 1
		
		expect(spy).toBeCalledTimes(1)
	})
	
	test('Forget mock set, throw error', () => {
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(() => bob.alice.setter = 1).toThrowError(new ShouldBeMockedDependencyError('alice', 'setter', 'set'))
	})
})