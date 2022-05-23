import { DuplicateDependencyError } from '../Errors'
import { ILifetime, Lifetime, Scoped, Singleton, Transient } from '../Lifetime'
import { IServiceProvider, ScopedServiceProvider, ServiceProvider } from '../ServiceProvider'
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
} from './types'

export class ServiceCollection<E = {}> {
	private readonly self: ServiceCollection<any>
	private readonly lifetimes: LifetimeCollection
	
	constructor(other?: ServiceCollection, lifetime?: ILifetime<any, E>) {
		this.self = this
		this.lifetimes = other?.lifetimes ?? {}
		if (lifetime) this.lifetimes[lifetime.name] = lifetime
	}
	
	addMultiple<T>(func: (services: ServiceCollection<E>) => ServiceCollection<T>) {
		return func(this)
	}
	
	addStateful<T, P, K extends string>(
		name: K & (K extends keyof E ? never : any),
		Dependency: StatefulDependencyOptions<T, P, { [key in ((keyof E) | K)]: key extends keyof E ? E[key] : Stateful<P, T> }>,
	) {
		const last = Lifetime.dummy(`${name}@constructor`)
		
		const factory = typeof Dependency === 'function'
			? (provider: E, props: P) => new Dependency(provider as any, props)
			: Dependency.factory
		
		function next({ instances }: ScopedServiceProvider): number {
			instances[name] = instances[name] || 1
			return instances[name]++
		}
		
		return this.add<Stateful<P, T>, K>(Transient, name as any, {
			factory: (proxy, context) => {
				const parentContext = context.parent as ScopedServiceProvider<E>
				const { isSingleton, name: lastName } = context.lastSingleton ?? {}
				const singleton = lastName ? `${String(lastName)}@` : ''
				
				const escapedContext = new ScopedServiceProvider(context.root)
					.enter(parentContext.depth && last)
					.enter(Lifetime.dummy(`${singleton}${name}#${next(context)}`, isSingleton))
				const trappedContext = parentContext.enter(Lifetime.dummy(`${name}#`))
				
				return {
					create: (props: P) => {
						const context = parentContext.isDone || !parentContext.depth ? escapedContext : trappedContext
						return factory(context.proxy as any, props, context as any)
					},
				}
			},
		})
	}
	
	addSingleton<T, K extends string>(name: K & (K extends keyof E ? never : any),
	                                  Dependency: DependencyOptions<T, E>) {
		return this.add<T, K>(Singleton, name, Dependency)
	}
	
	addScoped<T, K extends string>(name: K & (K extends keyof E ? never : any),
	                               Dependency: DependencyOptions<T, E>) {
		return this.add<T, K>(Scoped, name, Dependency)
	}
	
	addTransient<T, K extends string>(name: K & (K extends keyof E ? never : any),
	                                  Dependency: DependencyOptions<T, E>) {
		return this.add<T, K>(Transient, name, Dependency)
	}
	
	add<T, K extends string>(Lifetime: LifetimeConstructor,
	                         name: K & (K extends keyof E ? never : any),
	                         Dependency: DependencyOptions<T, E>,
	) {
		if (name in this.lifetimes) throw new DuplicateDependencyError(name)
		type Provided = { [key in ((keyof E) | K)]: key extends keyof E ? E[key] : T }
		return new ServiceCollection<{ [key in keyof Provided]: Provided[key] }>(
			this.self,
			new Lifetime(name, this.extractFactory(Dependency)))
	}
	
	get<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
		return this.lifetimes[extractSelector(selector)] as ILifetime<T, E>
	}
	
	remove<T, K extends string>(selector: Selector<T, E>) {
		delete this.lifetimes[extractSelector(selector)]
		type Provided = { [key in keyof Omit<E, K>]: key extends keyof E ? E[key] : T }
		return new ServiceCollection<{ [key in keyof Provided]: Provided[key] }>(this.self)
	}
	
	build(): IServiceProvider<E> {
		return new ServiceProvider<E>(this.cloneLifetimes())
	}
	
	buildMock(mock: MockSetup<E> = {}): IServiceProvider<E> {
		return proxyLifetimes(this, mock)
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