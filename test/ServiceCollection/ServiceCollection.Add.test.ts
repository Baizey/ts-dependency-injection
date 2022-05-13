import { DuplicateDependencyError, Scoped, Singleton, Transient } from '../../src'
import { Services, UUID } from '../testUtils'

class Dummy {
	id = UUID.randomUUID()
}

test('addSingleton', () => {
	const services = Services()
	const spy = jest.spyOn(services, 'add')
	services.addSingleton(Dummy, 'alice')
	expect(spy).toBeCalledTimes(1)
	expect(services.get((p) => p.alice)).toBeInstanceOf(Singleton)
})

test('addScoped', () => {
	const services = Services()
	const spy = jest.spyOn(services, 'add')
	services.addScoped(Dummy, (p) => p.alice)
	expect(spy).toBeCalledTimes(1)
	expect(services.get((p) => p.alice)).toBeInstanceOf(Scoped)
})

test('addTransient', () => {
	const services = Services<{ alice: Dummy }>()
	const spy = jest.spyOn(services, 'add')
	
	services.addTransient(Dummy, 'alice')
	
	expect(spy).toBeCalledTimes(1)
	expect(services.get((p) => p.alice)).toBeInstanceOf(Transient)
})

test('Adding twice should give duplicate error', () => {
	const sut = Services()
	sut.add(Singleton, Dummy, 'a')
	expect(() => sut.add(Singleton, Dummy, 'a'))
		.toThrowError(new DuplicateDependencyError('a'))
})