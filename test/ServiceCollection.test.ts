import {
	DuplicateDependencyError,
	propertyOf,
	Scoped,
	ScopedServiceProvider,
	ServiceCollection,
	Services,
	ShouldBeMockedDependencyError,
	Singleton,
	Transient,
} from '../src'
import { Context, dummy, UUID } from './testUtils'

class Dummy {}

const services = propertyOf<ServiceCollection>()

describe(services.add, () => {
	test('add', () => {
		const sut = Services().add(Singleton, 'a', Dummy)
		expect(sut.get('a')).toBeTruthy()
	})
	test('addSingleton', () => {
		const sut = Services()
		const spy = jest.spyOn(sut, 'add')
		const actual = sut.addSingleton('alice', Dummy)
		expect(spy).toBeCalledTimes(1)
		expect(actual.get((p) => p.alice)).toBeInstanceOf(Singleton)
	})
	test('addScoped', () => {
		const sut = Services()
		const spy = jest.spyOn(sut, 'add')
		const actual = sut.addScoped('alice', Dummy)
		expect(spy).toBeCalledTimes(1)
		expect(actual.get((p) => p.alice)).toBeInstanceOf(Scoped)
	})
	test('addTransient', () => {
		const sut = Services()
		const spy = jest.spyOn(sut, 'add')
		const actual = sut.addTransient('alice', Dummy)
		expect(spy).toBeCalledTimes(1)
		expect(actual.get((p) => p.alice)).toBeInstanceOf(Transient)
	})
	test('addStateful', () => {
		const sut = Services()
		const spy = jest.spyOn(sut, 'add')
		const actual = sut.addStateful('alice', Dummy)
		expect(spy).toBeCalledTimes(1)
		expect(actual.get((p) => p.alice)).toBeInstanceOf(Transient)
		expect(actual.get('alice')?.provide(new ScopedServiceProvider(Context()))).toHaveProperty('create')
	})
	test('Adding twice should give duplicate error', () => {
		const sut = Services().add(Singleton, 'a', Dummy)
		// @ts-ignore
		expect(() => sut.add(Singleton, 'a', Dummy))
			.toThrowError(new DuplicateDependencyError('a'))
	})
})

describe(services.remove, () => {
	test('Service is removed', () => {
		const sut = Services().addSingleton('a', Dummy)
		const actual = sut.remove('a')
		expect(actual.get('a' as any)).toBeUndefined()
	})
	test('Service is removed and re-added', () => {
		const sut = Services().addSingleton('a', Dummy).remove('a')
		const actual = sut.addSingleton('a', Dummy)
		expect(actual.get('a')).toBeTruthy()
	})
})

describe(services.buildMock, () => {
	test('Root is normal, dependencies are mocked', () => {
		const { bob, alice } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(alice.id).toBeTruthy()
		expect(() => bob.alice.id).toThrowError(new ShouldBeMockedDependencyError('alice', 'id', 'get'))
	})
	test('Forget mocking, throw error', () => {
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock()
		expect(() => bob.alice.func()).toThrowError(new ShouldBeMockedDependencyError('alice', 'func', 'get'))
		expect(() => bob.alice.getter).toThrowError(new ShouldBeMockedDependencyError('alice', 'getter', 'get'))
		expect(() => bob.alice.setter = 1).toThrowError(new ShouldBeMockedDependencyError('alice', 'setter', 'set'))
	})
	test('Mocked dependencies, succeed', () => {
		// noinspection JSUnusedLocalSymbols
		const mock = {
			func: () => UUID.randomUUID(),
			get getter() { return UUID.randomUUID() },
			set setter(v: any) { },
		}
		const spyFunc = jest.spyOn(mock, 'func')
		const spyGet = jest.spyOn(mock, 'getter', 'get')
		const spySet = jest.spyOn(mock, 'setter', 'set')
		
		const { bob } = dummy()
			.singleton('alice')
			.singleton('bob', ({ alice }) => ({ alice }))
			.mock({ alice: mock })
		
		expect(bob.alice.func()).toBeTruthy()
		expect(bob.alice.getter).toBeTruthy()
		expect(bob.alice.setter = 1).toBeTruthy()
		expect(spyFunc).toBeCalledTimes(1)
		expect(spyGet).toBeCalledTimes(1)
		expect(spySet).toBeCalledTimes(1)
	})
	test('Stateful instance should be given mocked dependencies', () => {
		const { stateful } = dummy()
			.scoped('scoped', ({ stateful }) => ({ stateful }), 'stateful')
			.stateful('stateful', ({ stateful, scoped }) => ({ stateful, scoped }))
			.mock()
		expect(() => stateful.create().scoped.stateful)
			.toThrowError(new ShouldBeMockedDependencyError('scoped', 'stateful', 'get'))
	})
	test('Service with Stateful dependency should be given mocked Stateful', () => {
		const { scoped } = dummy()
			.stateful('stateful', ({ stateful }) => ({ stateful }))
			.scoped('scoped', ({ stateful }) => ({ stateful }))
			.mock()
		expect(() => scoped.stateful.create())
			.toThrowError(new ShouldBeMockedDependencyError('stateful', 'create', 'get'))
	})
})