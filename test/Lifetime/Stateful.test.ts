import { CircularDependencyError, ShouldBeMockedDependencyError, SingletonScopedDependencyError } from '../../src'
import { statefulProvider } from '../models/StatefulProvider'

test('Using circular factory in constructor gives circular error', () => {
	const { circular } = statefulProvider()
	expect(() => circular.create())
		.toThrowError(new CircularDependencyError('circular@constructor',
			['circular@creator#1', 'circular@constructor', 'circular@creator#2']))
})

test('Singleton dependency chain has scope restraints', () => {
	const { singleton } = statefulProvider()
	expect(() => singleton.stateful.create())
		.toThrowError(new SingletonScopedDependencyError('singleton@stateful@creator#1', 'scoped'))
})

test('Non-singleton dependency chain has no scope restraints', () => {
	const { transient } = statefulProvider()
	expect(transient.stateful.create())
		.toBeTruthy()
})

test('Stateful instance should be given mocked dependencies', () => {
	const { stateful } = statefulProvider(true)
	expect(() => stateful.create().scoped.stateful)
		.toThrowError(new ShouldBeMockedDependencyError('scoped', 'stateful', 'get'))
})

test('Service with Stateful dependency should be given mocked Stateful', () => {
	const { transient } = statefulProvider(true)
	expect(() => transient.stateful.create())
		.toThrowError(new ShouldBeMockedDependencyError('stateful', 'create', 'get'))
})

test('Service with Stateful dependency should be given mocked Stateful', () => {
	const { transient } = statefulProvider(true)
	expect(() => transient.stateful.create())
		.toThrowError(new ShouldBeMockedDependencyError('stateful', 'create', 'get'))
})