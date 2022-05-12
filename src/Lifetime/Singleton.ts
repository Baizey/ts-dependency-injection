import { Factory, Key } from '../ServiceCollection'
import { ScopedContext } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class Singleton<T, E> implements ILifetime<T, E> {
	readonly isSingleton = true
	readonly name: Key<E>
	factory: Factory<T, E>
	private value?: T
	
	constructor(name: Key<E>, factory: Factory<T, E>) {
		this.name = name
		this.factory = factory
	}
	
	provide(context: ScopedContext<E>) {
		if (this.value) return this.value
		this.value = this.factory(context.proxy, context)
		return this.value
	}
	
	clone(): ILifetime<T, E> {
		return new Singleton(this.name, this.factory)
	}
}