import { propertyOf, ScopedContext } from '../src'

const provider = propertyOf<ScopedContext>()

describe(provider.lastSingleton, () => {
	test('dummy', () => {
		expect(true).toBeTruthy()
	})
})