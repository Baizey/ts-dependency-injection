import { Key } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'

export interface DependencyInfo<E = any> {
	readonly name: Key<E>,
	readonly isSingleton?: boolean
}

export interface ILifetime<T, E> extends DependencyInfo<E> {
	provide( context: ScopedServiceProvider<E> ): T
	
	clone(): ILifetime<T, E>
}

export class Lifetime {
	
	// noinspection JSUnusedLocalSymbols
	private constructor() {}
	
	static dummy<E = any>(name: Key<E>, isSingleton?: boolean): ILifetime<null, E> {
		return {
			clone() { return null as unknown as ILifetime<null, E> },
			provide() { return null },
			name,
			isSingleton,
		}
	}
}