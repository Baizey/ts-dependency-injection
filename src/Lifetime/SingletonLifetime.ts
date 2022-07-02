import { Factory, Key } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class SingletonLifetime<T, E> implements ILifetime<T, E> {
	private readonly factory: Factory<T, void, E>
	readonly isSingleton = true
	readonly name: Key<E>
	
	constructor( name: Key<E>, factory: Factory<T, void, E> ) {
		this.name = name
		this.factory = factory
	}
	
	provide( context: ScopedServiceProvider<E> ) {
		const { root: { instances }, proxy } = context
		if (!instances[this.name]) instances[this.name] = this.factory( proxy, undefined, context )
		return instances[this.name]
	}
	
	public clone(): ILifetime<T, E> {
		return new SingletonLifetime( this.name, this.factory )
	}
}