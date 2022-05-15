import { DuplicateDependencyError } from '../Errors'
import { ILifetime, Lifetime, Scoped, Singleton, Transient } from '../Lifetime'
import { IServiceProvider, ProviderScope, ServiceProvider } from '../ServiceProvider'
import { extractSelector } from '../utils'
import { MockSetup, proxyLifetimes } from './mockUtils'
import {
	DependencyOptions,
	Factory,
	Key,
	LifetimeCollection,
	LifetimeConstructor,
	Selector,
	Stateful,
	StatefulDependencyOptions,
	StatefulFactory,
} from './types'

export class ServiceCollection<E = {}> {
	private readonly self: ServiceCollection<any>
	private readonly lifetimes: LifetimeCollection
	
	constructor(other?: ServiceCollection, lifetime?: ILifetime<any, E>) {
		this.self = this
		this.lifetimes = other?.lifetimes ?? {}
		if (lifetime) this.lifetimes[lifetime.name] = lifetime
	}
	
	addStateful<T, KE, P>(
		name: keyof KE & Key<KE> & (keyof KE extends keyof E ? never : any),
		Dependency: StatefulDependencyOptions<T, P, E>,
	): ServiceCollection<{ [key in keyof KE]: Stateful<P, T> } & E> {
		const last = Lifetime.dummy(`${name}@constructor`)
		const factory = this.extractStatefulFactory(Dependency)
		
		function next(scope: ProviderScope): number {
			scope[name] = scope[name] || 1
			return scope[name]++
		}
		
		return this.add<Stateful<P, T>, KE>(Transient, name, {
			factory: (_, context) => {
				const { isSingleton, name: lastName } = context.lastSingleton ?? {}
				const singleton = lastName ? `${String(lastName)}@` : ''
				const track = Lifetime.dummy(`${singleton}${name}@creator#${next(context.scope)}`, isSingleton)
				
				return {
					create: (props: P) => {
						const lifetimes = [context.depth && last, track].filter(e => e) as ILifetime[]
						return context.enter(lifetimes, () => factory(context.proxy, props, context))
					},
				}
			},
		})
	}
	
	addSingleton<T, KE>(name: keyof KE & Key<KE> & (keyof KE extends keyof E ? never : any),
	                    Dependency: DependencyOptions<T, E>) {
		return this.add<T, KE>(Singleton, name, Dependency)
	}
	
	addScoped<T, KE>(name: keyof KE & Key<KE> & (keyof KE extends keyof E ? never : any),
	                 Dependency: DependencyOptions<T, E>) {
		return this.add<T, KE>(Scoped, name, Dependency)
	}
	
	addTransient<T, KE>(name: keyof KE & Key<KE> & (keyof KE extends keyof E ? never : any),
	                    Dependency: DependencyOptions<T, E>) {
		return this.add<T, KE>(Transient, name, Dependency)
	}
	
	add<T, KE>(Lifetime: LifetimeConstructor,
	           name: keyof KE & Key<KE> & (keyof KE extends keyof E ? never : any),
	           Dependency: DependencyOptions<T, E>) {
		if (name in this.lifetimes) throw new DuplicateDependencyError(name)
		return new ServiceCollection<{ [key in keyof KE]: T } & E>(
			this.self,
			new Lifetime(name, this.extractFactory(Dependency)))
	}
	
	get<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
		return this.lifetimes[extractSelector(selector)] as ILifetime<T, E>
	}
	
	remove<T, KE>(selector: Selector<T, E, KE>) {
		delete this.lifetimes[extractSelector(selector)]
		return new ServiceCollection<Omit<E, keyof KE>>(this.self)
	}
	
	build(): IServiceProvider<E> {
		return new ServiceProvider<E>(this.cloneLifetimes())
	}
	
	buildMock(mock: MockSetup<E> = {}): IServiceProvider<E> {
		return proxyLifetimes(this, mock)
	}
	
	private extractStatefulFactory<T, P>(Option: StatefulDependencyOptions<T, P, E>): StatefulFactory<T, P, E> {
		return typeof Option === 'function'
			? (provider, props) => new Option(provider, props)
			: Option.factory
	}
	
	private extractFactory<T>(Option: DependencyOptions<T, E>): Factory<T, E> {
		return typeof Option === 'function'
			? provider => new Option(provider)
			: Option.factory
	}
	
	private cloneLifetimes(): LifetimeCollection<E> {
		return Object.entries<ILifetime<unknown, E>>(this.lifetimes)
			.map(([key, value]) => [key, value.clone()] as [Key<E>, ILifetime<unknown, E>])
			.reduce((acc, [key, value]) => {
				acc[key] = value
				return acc
			}, {} as LifetimeCollection)
	}
}