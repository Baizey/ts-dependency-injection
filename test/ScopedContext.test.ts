import { propertyOf, ScopedServiceProvider } from '../src'

const provider = propertyOf<ScopedServiceProvider>()

describe(provider.lastSingleton, () => {
	test('dummy', () => {
		expect(true).toBeTruthy()
	})
})