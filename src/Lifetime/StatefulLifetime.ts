import {
	DependencyFactory,
	DependencyInformation,
	FactoryOption,
	Key,
	Stateful,
	StatefulConstructor,
} from '../ServiceCollection'
import { ScopedServiceProvider } from '../ServiceProvider'
import { ILifetime, Lifetime } from './ILifetime'

export class StatefulLifetime<T, P, E> implements ILifetime<Stateful<P, T>, E> {
	public readonly name: Key<E>
	private readonly factory: DependencyFactory<T, P, E>
	private last: ILifetime<null, E>
	private readonly next: ( { instances }: ScopedServiceProvider ) => number
	
	constructor( name: Key<E>, factory: DependencyFactory<T, P, E> ) {
		this.name = name
		this.factory = factory
		
		this.last = Lifetime.dummy( `${name}@constructor` )
		this.next = function( { instances }: ScopedServiceProvider ): number {
			instances[name] = instances[name] || 1
			return instances[name]++
		}
	}
	
	public provide( context: ScopedServiceProvider<E> ): Stateful<P, T> {
		const parentContext = context.parent as ScopedServiceProvider<E>
		const { isSingleton, name: lastName } = context.lastSingleton ?? {}
		const singleton = lastName ? `${String( lastName )}@` : ''
		
		const escapedContext = new ScopedServiceProvider( context.root )
			.enter( parentContext.depth && this.last )
			.enter( Lifetime.dummy( `${singleton}${this.name}#${this.next( context )}`, isSingleton ) )
		const trappedContext = parentContext.enter( Lifetime.dummy( `${this.name}#` ) )
		
		return {
			create: ( props: P ) => {
				const context = parentContext.isDone || !parentContext.depth ? escapedContext : trappedContext
				return this.factory( context.proxy as any, props, context as any )
			},
		}
	}
	
	public clone(): ILifetime<Stateful<P, T>, E> {
		return new StatefulLifetime( this.name, this.factory )
	}
}

export function stateful<T, P, E>( dep: FactoryOption<T, P, E> | StatefulConstructor<T, P, E> ): DependencyInformation<Stateful<P, T>, E> {
	return (typeof dep === 'function'
			? { lifetime: StatefulLifetime, constructor: dep }
			: { lifetime: StatefulLifetime, ...dep }
	) as unknown as DependencyInformation<Stateful<P, T>, E>
}