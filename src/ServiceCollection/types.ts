import { ILifetime } from '../Lifetime'
import { ScopedServiceProvider } from '../ServiceProvider'

export type Key<E> = keyof E & (string)

export type LifetimeConstructor<T = any, P = void, E = any> =
	{ new( name: Key<E>, factory: Factory<T, P, E> ): ILifetime<T, E> }

export type LifetimeCollection<E = any> = { [key in keyof E]: ILifetime<unknown, E> }
export type MatchingProperties<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E]
export type SelectorOptions<T = any, E = any> = { [key in MatchingProperties<T, E>]: key & Key<E> }
export type Selector<T, E> = Key<E> | (( e: SelectorOptions<T, E> ) => Key<E>)

export type Stateful<P, T> = { create( props: P ): T }

export type Factory<T, P, E> = ( provider: E, props: P, scope: ScopedServiceProvider<E> ) => T

export type StatefulConstructor<T, P, E> = { new( provider: E, props: P ): T }

export type NormalConstructor<T, E> = { new( provider: E ): T } | { new(): T }

export type FactoryOption<T, P, E> = { factory: Factory<T, P, E> }
export type ConstructorOption<T, E> = { constructor: NormalConstructor<T, E> }
export type DependencyOption<T, E> = FactoryOption<T, void, E> | ConstructorOption<T, E>
export type DependencyInformation<T, E> = { lifetime: LifetimeConstructor } & DependencyOption<T, E>

export type DependencyMap<E, F> = { [key in keyof F]: DependencyInformation<F[key], any> }