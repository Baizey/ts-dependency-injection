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
	private readonly next: ( { instances }: ScopedServiceProvider ) => number

	constructor( name: Key<E>, factory: DependencyFactory<T, P, E> ) {
		this.name = name
		this.factory = factory

		this.next = function ( { instances }: ScopedServiceProvider ): number {
			instances[name] = instances[name] || 1
			return instances[name]++
		}
	}

	public provide( context: ScopedServiceProvider<E> ): Stateful<P, T> {
		const parentContext = context.parent as ScopedServiceProvider<E>
		const { isSingleton } = context.lastSingleton ?? {}
		const name = this.name
		const next = this.next

		function createContext(): ScopedServiceProvider<E> {

			if ( !parentContext.depth || !parentContext.isDone ) {
				return parentContext
					.enter( Lifetime.dummy( `${ name }@instance`, isSingleton ) )
			}

			const id = next( parentContext )

			return new ScopedServiceProvider( context.root )
				.enter( Lifetime.dummy( `${ name }@instance#${ id }`, isSingleton ) )
		}

		return {
			create: ( props: P ) => {
				const usedContext = createContext()
				const result = this.factory( usedContext.proxy, props, usedContext )
				usedContext.escape()
				return result
			},
		}
	}

	public clone(): ILifetime<Stateful<P, T>, E> {
		return new StatefulLifetime( this.name, this.factory )
	}
}

export function stateful<T, P, E>( dep: FactoryOption<T, P, E> | StatefulConstructor<T, P, E> ): DependencyInformation<Stateful<P, T>, E> {
	return ( typeof dep === 'function'
			? { lifetime: StatefulLifetime, constructor: dep }
			: { lifetime: StatefulLifetime, ...dep }
	) as unknown as DependencyInformation<Stateful<P, T>, E>
}