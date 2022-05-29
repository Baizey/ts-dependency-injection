import { Key, LifetimeConstructor } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'

export interface DependencyInfo<E = any> {
	readonly name: Key<E>,
	readonly isSingleton?: boolean
}

export interface ILifetime<T = any, E = any> extends DependencyInfo<E> {
	provide(context: ScopedServiceProvider<E>): T
	
	get Lifetime(): LifetimeConstructor<T, E>
	
	clone(): ILifetime<T, E>
}

export class Lifetime {
	
	// noinspection JSUnusedLocalSymbols
	private constructor() {}
	
	static dummy<E = any>(name: Key<E>, isSingleton?: boolean): ILifetime<null, E> {
		return {
			clone() { return this },
			provide() { return null },
			get Lifetime() { return null as any },
			name,
			isSingleton,
		}
	}
}