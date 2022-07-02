import {
	DependencyInformation,
	FactoryOption,
	NormalConstructor,
	Stateful,
	StatefulConstructor,
} from '../ServiceCollection'
import { ScopedLifetime } from './ScopedLifetime'
import { SingletonLifetime } from './SingletonLifetime'
import { StatefulLifetime } from './StatefulLifetime'
import { TransientLifetime } from './TransientLifetime'

export * from './ILifetime'

export function singleton<T, E>( dep: FactoryOption<T, void, E> | NormalConstructor<T, E> ): DependencyInformation<T, E> {
	return typeof dep === 'function'
		? { lifetime: SingletonLifetime, constructor: dep }
		: { lifetime: SingletonLifetime, ...dep }
}

export function scoped<T, E>( dep: FactoryOption<T, void, E> | NormalConstructor<T, E> ): DependencyInformation<T, E> {
	return typeof dep === 'function'
		? { lifetime: ScopedLifetime, constructor: dep }
		: { lifetime: ScopedLifetime, ...dep }
}

export function transient<T, E>( dep: FactoryOption<T, void, E> | NormalConstructor<T, E> ): DependencyInformation<T, E> {
	return typeof dep === 'function'
		? { lifetime: TransientLifetime, constructor: dep }
		: { lifetime: TransientLifetime, ...dep }
}

export function stateful<T, P, E>( dep: FactoryOption<T, P, E> | StatefulConstructor<T, P, E> ): DependencyInformation<Stateful<P, T>, E> {
	return (typeof dep === 'function'
			? { lifetime: StatefulLifetime, constructor: dep }
			: { lifetime: StatefulLifetime, ...dep }
	) as unknown as DependencyInformation<Stateful<P, T>, E>
}