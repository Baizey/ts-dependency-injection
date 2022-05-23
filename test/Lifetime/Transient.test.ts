import 'jest'
import { Transient } from '../../src'
import { Context, Lifetime, propertyOfLifetime, UUID } from '../testUtils'

describe(propertyOfLifetime.provide, () => {
	test('Never returns the same, even if same context', () => {
		const sut = Lifetime(Transient)
		const context = Context()
		
		const expected = sut.provide(context)
		const actual = sut.provide(context)
		
		expect(expected).not.toEqual(actual)
	})
	
	test('Ignores anything in scoped', () => {
		const notExpected = UUID.randomUUID()
		const context = Context()
		const sut = Lifetime(Transient)
		context.instances[sut.name] = notExpected
		
		const actual = sut.provide(context)
		
		expect(actual).not.toEqual(notExpected)
	})
})

describe(propertyOfLifetime.isSingleton, () => {
	test('should be false', () => expect(Lifetime(Transient).isSingleton).toBeFalsy())
})