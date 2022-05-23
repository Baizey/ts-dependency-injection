import 'jest'
import { Scoped, ScopedServiceProvider, Singleton, SingletonScopedDependencyError } from '../../src'
import { Context, Lifetime, propertyOfLifetime, UUID } from '../testUtils'

describe(propertyOfLifetime.provide, () => {
	test('In different contexts with lifetime returns different', () => {
		const sut = Lifetime(Scoped)
		
		const actual = sut.provide(Context())
		const other = sut.provide(Context())
		
		expect(actual).not.toEqual(other)
	})
	
	test('In context with lifetime already used returns same', () => {
		const expected = UUID.randomUUID()
		const sut = Lifetime(Scoped)
		const context = Context()
		context.instances[sut.name] = expected
		
		const actual = sut.provide(context)
		
		expect(actual).toEqual(expected)
	})
	
	test('Twice in same context returns same', () => {
		const sut = Lifetime(Scoped)
		const context = Context()
		
		const expected = sut.provide(context)
		const actual = sut.provide(context)
		
		expect(actual).toEqual(expected)
	})
})

describe(propertyOfLifetime.isSingleton, () => {
	test('should be false', () => expect(Lifetime(Scoped).isSingleton).toBeFalsy())
})

describe(SingletonScopedDependencyError.name, () => {
	test('fail providing if in scope with a singleton', () => {
		const singleton = Lifetime(Singleton)
		const context = new ScopedServiceProvider(Context(), singleton)
		const sut = Lifetime(Scoped)
		expect(() => sut.provide(context))
			.toThrowError(new SingletonScopedDependencyError(singleton.name, sut.name))
	})
})