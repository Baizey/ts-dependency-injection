import { SingletonScopedDependencyError } from '../Errors'
import { Factory, Key } from '../ServiceCollection'
import { ScopedContext } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class Scoped<T, E> implements ILifetime<T, E> {
	readonly isSingleton = false
	readonly name: Key<E>
	factory: Factory<T, E>
	
	constructor(name: Key<E>, factory: Factory<T, E>) {
		this.name = name
		this.factory = factory
	}
	
	provide(context: ScopedContext<E>) {
		const {
			lastSingleton,
			scope,
		} = context
		if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton.name, this.name)
		
		scope[this.name] = scope[this.name] ?? this.factory(context.proxy, context)
		
		return scope[this.name]
	}
	
	clone(): ILifetime<T, E> {
		return new Scoped(this.name, this.factory)
	}
}