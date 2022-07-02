import { DuplicateDependencyError } from '../Errors'
import { CollectionDependencyError, DependencyError } from '../Errors/DependencyError'
import { ILifetime } from '../Lifetime'
import { IServiceProvider, ServiceProvider } from '../ServiceProvider'
import { extractSelector } from '../utils'
import { MockStrategy, ProviderMock, proxyLifetimes } from './mockUtils'
import { DependencyInformation, DependencyMap, LifetimeCollection, Selector } from './types'

export class ServiceCollection<E = {}> {
	private readonly self: ServiceCollection<any>
	private readonly lifetimes: LifetimeCollection
	
	constructor() {
		this.self = this
		this.lifetimes = {}
	}
	
	addMethod<F>( func: ( services: ServiceCollection<E> ) => ServiceCollection<F> ) {
		return func( this )
	}
	
	add<KT, F extends DependencyMap<E, KT>>( dependencies: F & DependencyMap<E, KT> ) {
		const errors: DependencyError[] = []
		Object.entries<DependencyInformation<unknown, any>>( dependencies ).forEach( ( [name, data] ) => {
			if (name in this.lifetimes) errors.push( new DuplicateDependencyError( name ) )
			
			const factory = 'factory' in data
				? data.factory
				// @ts-ignore the factory can be either p => new or (p, props) => new but ts don't know this
				: ( p: any, props: any ) => new data.constructor( p, props )
			
			const { lifetime: Lifetime } = data
			this.lifetimes[name] = new Lifetime( name, factory )
		} )
		
		switch (errors.length) {
			case 0:
				return this as unknown as ServiceCollection<{
					[key in (keyof KT | keyof E)]:
					key extends keyof E
						? E[key] : key extends keyof KT
							? KT[key]
							: never
				}>
			case 1:
				throw errors[0]
			default:
				throw new CollectionDependencyError( errors )
		}
	}
	
	get<T>( selector: Selector<T, E> ): ILifetime<T, E> | undefined {
		return this.lifetimes[extractSelector( selector )] as ILifetime<T, E>
	}
	
	remove<T, K extends string>( selector: Selector<T, E> ) {
		delete this.lifetimes[extractSelector( selector )]
		type Provided = { [key in keyof Omit<E, K>]: key extends keyof E ? E[key] : T }
		return this as unknown as ServiceCollection<{ [key in keyof Provided]: Provided[key] }>
	}
	
	build(): IServiceProvider<E> {
		const lifetimes = Object.values( this.lifetimes )
			.map( ( e: ILifetime<any, E> ) => e.clone() )
			.reduce( ( a, b ) => {
				a[b.name] = b
				return a
			}, {} as LifetimeCollection )
		return new ServiceProvider<E>( lifetimes )
	}
	
	buildMock( mock: MockStrategy | ProviderMock<E> = {}, defaultMockType?: MockStrategy ): IServiceProvider<E> {
		return proxyLifetimes( this, mock, defaultMockType )
	}
}