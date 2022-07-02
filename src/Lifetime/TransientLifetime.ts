import { DependencyFactory, DependencyInformation, FactoryOption, Key, NormalConstructor } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class TransientLifetime<T, E> implements ILifetime<T, E> {
	readonly name: Key<E>
	private readonly factory: DependencyFactory<T, void, E>
	
	constructor( name: Key<E>, factory: DependencyFactory<T, void, E> ) {
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

export function transient<T, E>( dep: FactoryOption<T, void, E> | NormalConstructor<T, E> ): DependencyInformation<T, E> {
	return typeof dep === 'function'
		? { lifetime: TransientLifetime, constructor: dep }
		: { lifetime: TransientLifetime, ...dep }
}