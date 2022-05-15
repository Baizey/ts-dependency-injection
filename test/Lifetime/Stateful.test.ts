import { CircularDependencyError, propertyOf, Services, SingletonScopedDependencyError, Stateful } from '../../src'
import { dummy } from '../testUtils'

const propertyOfStateful = propertyOf<Stateful<any, any>>()

class A {
	readonly a: Stateful<null, A>
	readonly props: null
	
	constructor({ a }: { a: Stateful<null, A> }, props: null) {
		this.a = a
		this.props = props
	}
}

describe(propertyOfStateful.create, () => {
	
	test('Stateful factory can depend on itself', () => {
		const sut = Services().addStateful('a', A).build().proxy
		expect(sut.a.create(null).a.create(null))
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