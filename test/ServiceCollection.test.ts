import {
	DuplicateDependencyError,
	MockStrategy,
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
	test('Default mock strategy should be followed', () => {
		const { a, sut } = dummy()
			.singleton('a')
			.singleton('sut', ({ a }) => ({ a }))
			.mock()
		expect(a.id).toBeTruthy()
		expect(sut.a.id).toBeNull()
	})
	
	test('Given mock strategy should be followed', () => {
		const { sut } = dummy()
			.singleton('a')
			.singleton('sut', ({ a }) => ({ a }))
			.mock({}, MockStrategy.exceptionStub)
		expect(() => sut.a.id).toThrowError(new ShouldBeMockedDependencyError('a', 'id', 'get'))
	})
	
	test('Dependency mock strategy should be followed', () => {
		const { sut } = dummy()
			.singleton('a')
			.singleton('b')
			.singleton('c')
			.singleton('sut', ({ a, b, c }) => ({ a, b, c }))
			.mock({
				a: MockStrategy.dummyStub,
				b: MockStrategy.exceptionStub,
				c: { id: UUID.randomUUID() },
			})
		expect(sut.a.id).toBeNull()
		expect(() => sut.b.id).toThrowError(new ShouldBeMockedDependencyError('b', 'id', 'get'))
		expect(sut.c.id).toBeTruthy()
		sut.c.id = 'cake'
		expect(sut.c.id).toBe('cake')
	})
	
	test('Property mock strategy should be followed', () => {
		const { sut } = dummy()
			.singleton('a')
			.singleton('sut', ({ a }) => ({ a }))
			.mock({
				a: {
					id: MockStrategy.nullStub,
					func: MockStrategy.exceptionStub,
					get getter() { return UUID.randomUUID() },
				},
			})
		expect(sut.a.id).toBeNull()
		expect(() => sut.a.func()).toThrowError(new ShouldBeMockedDependencyError('a', 'func', 'function'))
		expect(sut.getter).toBeTruthy()
	})
	
	test('Stateful instance should be given mocked dependencies', () => {
		const { stateful } = dummy()
			.scoped('scoped', ({ stateful }) => ({ stateful }), 'stateful')
			.stateful('stateful', ({ stateful, scoped }) => ({ stateful, scoped }))
			.mock(MockStrategy.exceptionStub)
		expect(() => stateful.create().scoped.stateful)
			.toThrowError(new ShouldBeMockedDependencyError('scoped', 'stateful', 'get'))
	})
	
	test('Service with Stateful dependency should be given mocked Stateful', () => {
		const { scoped } = dummy()
			.stateful('stateful', ({ stateful }) => ({ stateful }))
			.scoped('scoped', ({ stateful }) => ({ stateful }))
			.mock(MockStrategy.exceptionStub)
		expect(() => scoped.stateful.create())
			.toThrowError(new ShouldBeMockedDependencyError('stateful', 'create', 'function'))
	})
})