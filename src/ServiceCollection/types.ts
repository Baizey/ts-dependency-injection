import { ILifetime } from '../Lifetime'
import { ScopedServiceProvider } from '../ServiceProvider'

export type Key<E> = keyof E & (string)

export type LifetimeCollection<E = any> = { [key in keyof E]: ILifetime<unknown, E> }
export type MatchingProperties<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E]
export type SelectorOptions<T = any, E = any> = { [key in MatchingProperties<T, E>]: key & Key<E> }
export type Selector<T, E> = Key<E> | ((e: SelectorOptions<T, E>) => Key<E>)

export type Stateful<P, T> = { create(props: P): T }

export type StatefulDependencyOptions<T, P, E> =
	| { factory: StatefulFactory<T, P, E> }
	| StatefulDependencyConstructor<T, P, E>
export type StatefulDependencyConstructor<T, P, E> =
	| { new(provider: E, props: P): T }
	| { new(provider: E): T }
	| { new(): T }
export type StatefulFactory<T, P, E> = (provider: E, props: P, scope: ScopedServiceProvider<E>) => T

export type DependencyOptions<T, E> =
	| { factory: Factory<T, E> }
	| DependencyConstructor<T, E>
export type DependencyConstructor<T, E> =
	| { new(provider: E): T }
	| { new(): T }
export type Factory<T, E> = (provider: E, scope: ScopedServiceProvider<E>) => T

export type LifetimeConstructor<T = any, E = any> = new (name: Key<E>, factory: Factory<T, E>) => ILifetime<T, E>