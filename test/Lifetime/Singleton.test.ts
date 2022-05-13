import 'jest'
import { Singleton } from '../../src'
import { Context, Lifetime, propertyOfLifetime, Provider, UUID } from '../testUtils'

describe(propertyOfLifetime.provide, () => {
	test('Always returns the same with same root provider', () => {
		const sut = Lifetime(Singleton)
		const provider = Provider()
		provider.lifetimes[sut.name] = sut
		
		const expected = provider.provide(sut.name)
		const actual = provider.provide(sut.name)
		
		expect(expected).toEqual(actual)
	})
	
	test('Ignores anything in scoped', () => {
		const notExpected = UUID.randomUUID()
		const context = Context()
		const sut = Lifetime(Singleton)
		context.scope[sut.name] = notExpected
		
		const actual = sut.provide(context)
		
		expect(actual).not.toEqual(notExpected)
	})
	
	test('Twice in same context returns same', () => {
		const sut = Lifetime(Singleton)
		const context = Context()
		
		const expected = sut.provide(context)
		const actual = sut.provide(context)
		
		expect(actual).toEqual(expected)
	})
})

describe(propertyOfLifetime.isSingleton, () => {
	test('should be true', () => expect(Lifetime(Singleton).isSingleton).toBeTruthy())
})