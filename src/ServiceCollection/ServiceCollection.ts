import { DependencyErrorType, DuplicateDependencyError } from '../Errors'
import { ILifetime, Scoped, Singleton, Transient } from '../Lifetime'
import { IServiceProvider, ProviderScope, ScopedContext, ServiceProvider } from '../ServiceProvider'
import { extractSelector } from '../utils'
import {
	DependencyConstructor,
	DependencyOptions,
	Factory,
	IServiceCollection,
	Key,
	LifetimeConstructor,
	Selector,
	Stateful,
	StatefulDependencyConstructor,
} from './IServiceCollection'
import { MockSetup, proxyLifetimes } from './mockUtils'

export type RecordCollection<E> = Record<Key<E>, ILifetime<unknown, E>>;

export class ServiceCollection<E = any> implements IServiceCollection<E> {
	private readonly lifetimes: RecordCollection<E>
	
	constructor(other?: ServiceCollection) {
		this.lifetimes = other?.lifetimes ?? {}
	}
	
	replaceSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.replace(Singleton, options, selector)
	}
	
	replaceTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.replace(Transient, options, selector)
	}
	
	replaceScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.replace(Scoped, options, selector)
	}
	
	replace<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.remove(selector)
		this.add(Lifetime, dependency, selector)
	}
	
	tryAddSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.tryAdd(Singleton, options, selector)
	}
	
	tryAddTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.tryAdd(Transient, options, selector)
	}
	
	tryAddScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
		this.tryAdd(Scoped, options, selector)
	}
	
	tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
		try {
			this.add(Lifetime, dependency, selector)
		} catch (e) {
			if ((e as DuplicateDependencyError).type !== DependencyErrorType.Duplicate) throw e
		}
	}
	
	addStateful<T, P>(Constructor: StatefulDependencyConstructor<T, E, P>,
	                  selector: Selector<Stateful<P, T>, E>): void {
		const key = extractSelector(selector).toString()
		const last = { name: `${key}@constructor` }
		
		function next(scope: ProviderScope): number {
			scope[key] = scope[key] || 1
			return scope[key]++
		}
		
		return this.addTransient<Stateful<P, T>>({
			factory: (_, original) => {
				const stateful = new ScopedContext(original)
				const { isSingleton, name } = original.lastSingleton ?? {}
				const singleton = name ? `${String(name)}@` : ''
				const track = {
					name: `${singleton}${key}@creator#${next(original.scope)}`,
					isSingleton,
				}
				
				return {
					create: (props: P) => {
						const inParent = original.depth
						const context = inParent ? original : stateful
						if (inParent) context.enter(last)
						context.enter(track)
						const result = new Constructor(context.proxy, props)
						context.leave(track)
						if (inParent) context.leave(last)
						return result
					},
				}
			},
		}, selector)
	}
	
	addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
		this.add(Singleton, options, selector)
	}
	
	addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
		this.add(Transient, options, selector)
	}
	
	addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
		this.add(Scoped, options, selector)
	}
	
	addMultiple(Lifetime: LifetimeConstructor,
	            dependencies: Partial<{ [key in keyof E]: DependencyConstructor<E[key], E> }>) {
		Object.entries(dependencies).map(([key, value]) => ({
			key: key as Key<E>,
			value: value as DependencyConstructor,
		})).forEach(({ key, value }) => this.add(Lifetime, value, key))
	}
	
	add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void {
		const name = extractSelector(selector)
		if (name in this.lifetimes) throw new DuplicateDependencyError(name)
		this.lifetimes[name] = new Lifetime(name, this.extractFactory(dependency))
	}
	
	get<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
		return this.lifetimes[extractSelector(selector)] as ILifetime<T, E>
	}
	
	remove<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
		const result = this.get(selector)
		if (result) delete this.lifetimes[result.name]
		return result
	}
	
	build(): IServiceProvider<E> {
		return new ServiceProvider<E>(this.cloneLifetimes())
	}
	
	buildMock(mock: MockSetup<E> = {}): IServiceProvider<E> {
		return proxyLifetimes(this, mock)
	}
	
	private extractFactory<T>(Option: DependencyOptions<T, E>): Factory<T, E> {
		return typeof Option === 'function'
			? p => new Option(p)
			: Option.factory
	}
	
	private cloneLifetimes(): RecordCollection<E> {
		return Object.entries<ILifetime<unknown, E>>(this.lifetimes)
			.map(([key, value]) => [key, value.clone()] as [Key<E>, ILifetime<unknown, E>])
			.reduce((acc, [key, value]) => {
				acc[key] = value
				return acc
			}, {} as RecordCollection<E>)
	}
}