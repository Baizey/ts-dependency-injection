import { Factory, Key } from '../ServiceCollection'
import { ScopedContext } from '../ServiceProvider'

export interface DependencyInfo<E = any> {
	readonly name: Key<E>,
	readonly isSingleton?: boolean
}

export interface ILifetime<T, E> extends DependencyInfo<E> {
	factory: Factory<T, E>
	
	provide(context: ScopedContext<E>): T
	
	clone(): ILifetime<T, E>
}