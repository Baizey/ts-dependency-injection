import {
	CircularDependencyError,
	ShouldBeMockedDependencyError,
	SingletonScopedDependencyError,
	Stateful,
} from '../../src'
import { PropertyOf, propertyOf } from '../../src/utils'
import { dummy } from '../testUtils'

const propertyOfStateful = propertyOf as PropertyOf<Stateful<any, any>>

describe(propertyOfStateful.create, () => {
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
	
	test('Stateful instance should be given mocked dependencies', () => {
		const { stateful } = dummy()
			.scoped('scoped', ({ stateful }) => ({ stateful }), 'stateful')
			.stateful('stateful', ({ stateful, scoped }) => ({ stateful, scoped }))
			.mock()
		expect(() => stateful.create().scoped.stateful)
			.toThrowError(new ShouldBeMockedDependencyError('scoped', 'stateful', 'get'))
	})
	
	test('Service with Stateful dependency should be given mocked Stateful', () => {
		const { scoped } = dummy()
			.stateful('stateful', ({ stateful }) => ({ stateful }))
			.scoped('scoped', ({ stateful }) => ({ stateful }))
			.mock()
		expect(() => scoped.stateful.create())
			.toThrowError(new ShouldBeMockedDependencyError('stateful', 'create', 'get'))
	})
})