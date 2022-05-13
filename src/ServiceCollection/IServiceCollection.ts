import { ILifetime } from '../Lifetime'
import { IServiceProvider, ScopedContext } from '../ServiceProvider'
import { MockSetup } from './mockUtils'

export type Key<E> = keyof E & (string | symbol)

export type MatchingProperties<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E]
export type SelectorOptions<T, E> = { [key in MatchingProperties<T, E>]: key & Key<E> }
export type Selector<T, E> = Key<E> | ((e: SelectorOptions<T, E>) => Key<E>)

export type Stateful<P, T> = { create(props: P): T }
export type Factory<T, E> = (data: E, provider: ScopedContext<E>) => T
export type DependencyConstructor<T = any, E = any> = { new(props: E): T } | { new(): T }
export type StatefulDependencyConstructor<T = any, E = any, P = any> =
	{ new(provider: E, props: P): T }
	| DependencyConstructor<T, E>
export type DependencyOptions<T, E> = { factory: Factory<T, E> } | DependencyConstructor<T, E>

export type LifetimeConstructor<T = any, E = any> = new (name: Key<E>, factory: Factory<T, E>) => ILifetime<T, E>

export interface IServiceCollection<E = any> {
	replaceSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	replaceTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	replaceScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	replace<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	tryAddSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	tryAddTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	tryAddScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	addStateful<P, T>(constructor: StatefulDependencyConstructor<T, E, P>, selector: Selector<Stateful<P, T>, E>): void
	
	addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void
	
	get<T>(item: Selector<T, E>): ILifetime<T, E> | undefined
	
	remove<T>(item: Selector<T, E>): ILifetime<T, E> | undefined
	
	build(): IServiceProvider<E>
	
	buildMock(mock?: MockSetup<E>): IServiceProvider<E>
}