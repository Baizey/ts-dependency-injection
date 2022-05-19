import { SingletonScopedDependencyError } from '../Errors'
import { Factory, Key } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class Scoped<T, E> implements ILifetime<T, E> {
	private readonly factory: Factory<T, E>
	
	readonly name: Key<E>
	
	constructor(name: Key<E>, factory: Factory<T, E>) {
		this.name = name
		this.factory = factory
	}
	
	provide(context: ScopedServiceProvider<E>) {
		const { lastSingleton, scope, proxy } = context
		if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton.name, this.name)
		scope[this.name] = scope[this.name] ?? this.factory(proxy, context)
		return scope[this.name]
	}
	
	clone(): ILifetime<T, E> {
		return new Scoped(this.name, this.factory)
	}
}