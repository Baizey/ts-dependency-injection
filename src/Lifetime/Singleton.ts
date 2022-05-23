import { Factory, Key } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class Singleton<T, E> implements ILifetime<T, E> {
	private readonly factory: Factory<T, E>
	readonly isSingleton = true
	readonly name: Key<E>
	
	constructor(name: Key<E>, factory: Factory<T, E>) {
		this.name = name
		this.factory = factory
	}
	
	provide(context: ScopedServiceProvider<E>) {
		const { root: { instances }, proxy } = context
		if (!instances[this.name]) instances[this.name] = this.factory(proxy, context)
		return instances[this.name]
	}
	
	clone(): ILifetime<T, E> {
		return new Singleton(this.name, this.factory)
	}
}