import 'jest'
import { CircularDependencyError, ScopedContext, ServiceCollection, Singleton } from '../../src'
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from '../models'

function setup() {
	const services = new ServiceCollection<Provider>()
	services.add(Singleton, Alice, (p) => p.alice)
	services.add(Singleton, Bob, (p) => p.bob)
	services.add(Singleton, Dummy, (provider) => provider.dummy)
	return { services, context: new ScopedContext<Provider>(services.build()) }
}

test('Invoke', () => {
	const { services, context } = setup()
	const sut = services.get((p) => p.alice)
	
	const a = sut?.provide(context)
	
	expect(a).not.toBeUndefined()
})
test('Lifetime', () => {
	const { services, context } = setup()
	const sut = services.get((p) => p.alice)
	
	const a = sut?.provide(context)
	const b = sut?.provide(context)
	
	expect(a).not.toBeUndefined()
	expect(b).not.toBeUndefined()
	expect(a).toBe(b)
})
test('Circular dependency', () => {
	const services = new ServiceCollection<CircularProvider>()
	services.add(Singleton, CircularA, (p) => p.CircularA)
	services.add(Singleton, CircularB, (p) => p.CircularB)
	const sut = services.get((p) => p.CircularA)
	
	const context = new ScopedContext<CircularProvider>(services.build())
	
	expect(() => sut?.provide(context)).toThrowError(
		new CircularDependencyError('CircularB', ['CircularB', 'CircularA']),
	)
})