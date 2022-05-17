import { CircularDependencyError, propertyOf, Services, SingletonScopedDependencyError, Stateful } from '../../src'
import { dummy } from '../testUtils'

const propertyOfStateful = propertyOf<Stateful<any, any>>()

class A {}

class B { // noinspection JSUnusedLocalSymbols
	constructor(a: { a: A }, b: number) {}
}

class C {// noinspection JSUnusedLocalSymbols
	constructor(a: { a: A, 'c': Stateful<number, C> }, b: number) {}
}

describe(propertyOfStateful.create, () => {
	
	test('Stateful factory can depend on itself', () => {
		const { b } = Services()
			.addSingleton('a', A)
			.addStateful('b', B)
			.addStateful('c', C)
			.build().proxy
		expect(b.create(6))
	})
	
	test('Using circular factory in constructor gives circular error', () => {
		const { circular } = dummy()
			.stateful('circular', ({ circular }) => { circular.create() })
			.build()
		expect(() => circular.create())
			.toThrowError(new CircularDependencyError('circular@constructor',
				['circular@creator#1', 'circular@constructor', 'circular@creator#2']))
	})
	
	test('Singleton dependency chain has scope restraints', () => {
		const { singleton } = dummy()
			.scoped('scoped')
			.stateful('stateful', ({ stateful, scoped }) => ({ stateful, scoped }))
			.singleton('singleton', ({ stateful }) => ({ stateful }))
			.build()
		expect(() => singleton.stateful.create())
			.toThrowError(new SingletonScopedDependencyError('singleton@stateful@creator#1', 'scoped'))
	})
	
	test('Non-singleton dependency chain has no scope restraints', () => {
		const { transient } = dummy()
			.scoped('scoped')
			.stateful('stateful', ({ stateful, scoped }) => ({ stateful, scoped }))
			.transient('transient', ({ stateful }) => ({ stateful }))
			.build()
		expect(transient.stateful.create())
			.toBeTruthy()
	})
})