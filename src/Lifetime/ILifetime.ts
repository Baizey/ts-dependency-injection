import { Key } from '../ServiceCollection'
import { ScopedContext } from '../ServiceProvider'

export interface DependencyInfo<E = any> {
	readonly name: Key<E>,
	readonly isSingleton?: boolean
}

export interface ILifetime<T = any, E = any> extends DependencyInfo<E> {
	provide(context: ScopedContext<E>): T
	
	clone(): ILifetime<T, E>
}

export class Lifetime {
	
	// noinspection JSUnusedLocalSymbols
	private constructor() {}
	
	static dummy<E = any>(name: Key<E>, isSingleton?: boolean): ILifetime<null, E> {
		return {
			clone() { return this },
			provide() { return null },
			name,
			isSingleton,
		}
	}
}