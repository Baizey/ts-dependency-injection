import { ShouldBeMockedDependencyError } from '../Errors'
import { ILifetime } from '../Lifetime'
import { ScopedContext } from '../ServiceProvider'
import { Factory, Key } from './IServiceCollection'
import { RecordCollection } from './ServiceCollection'

export type MockSetup<E> = {
	[key in keyof E]?: Partial<E[key]> | Factory<Partial<E[key]>, E>;
};

export function proxyLifetimes<E>(lifetimes: RecordCollection<E>, mock: MockSetup<E>) {
	Object.values<ILifetime<unknown, E>>(lifetimes)
		.forEach((lifetime) => {
			const setup = mock[lifetime.name]
			// @ts-ignore
			lifetimes[lifetime.name] = proxyLifetime(lifetime, setup)
		})
}

export function proxyLifetime<E>(lifetime: ILifetime<unknown, E>, mock: MockSetup<E>[Key<E>] | undefined) {
	return new Proxy(lifetime, {
		get(target, prop: keyof ILifetime<unknown, E>) {
			const name = lifetime.name.toString()
			if (prop !== 'provide') return target[prop]
			return (context: ScopedContext<E>) => {
				if (context.depth === 1) return target.provide(context)
				switch (typeof mock) {
					case 'undefined':
						return proxyValue(name, {})
					case 'function':
						return proxyValue(name, mock(context.proxy, context))
					default:
						return proxyValue(name, mock)
				}
			}
		},
	})
}

export function proxyValue<T extends object>(name: string, obj: Partial<T>): T {
	// noinspection JSUnusedGlobalSymbols
	return new Proxy(obj,
		{
			get(target, prop: (symbol | string) & keyof T) {
				if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.get)
					return target[prop]
				throw new ShouldBeMockedDependencyError(name, prop.toString(), 'get')
			},
			set(target, prop: (symbol | string) & keyof T, value) {
				if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.set) {
					target[prop] = value
					return true
				}
				throw new ShouldBeMockedDependencyError(name, prop.toString(), 'set')
			},
		},
	) as T
}