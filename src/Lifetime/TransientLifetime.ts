import { Factory, Key } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class TransientLifetime<T, E> implements ILifetime<T, E> {
	readonly name: Key<E>
	private readonly factory: Factory<T, void, E>
	
	constructor( name: Key<E>, factory: Factory<T, void, E> ) {
		this.name = name
		this.factory = factory
	}
	
	provide( context: ScopedServiceProvider<E> ) {
		return this.factory( context.proxy, undefined, context )
	}
	
	public clone(): ILifetime<T, E> {
		return new TransientLifetime( this.name, this.factory )
	}
}