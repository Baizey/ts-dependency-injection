import { DependencyFactory, DependencyInformation, FactoryOption, Key, NormalConstructor } from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime } from './ILifetime'

export class SingletonLifetime<T, E> implements ILifetime<T, E> {
	private readonly factory: DependencyFactory<T, void, E>
	readonly isSingleton = true
	readonly name: Key<E>
	
	constructor( name: Key<E>, factory: DependencyFactory<T, void, E> ) {
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

export function singleton<T, E>( dep: FactoryOption<T, void, E> | NormalConstructor<T, E> ): DependencyInformation<T, E> {
	return typeof dep === 'function'
		? { lifetime: SingletonLifetime, constructor: dep }
		: { lifetime: SingletonLifetime, ...dep }
}