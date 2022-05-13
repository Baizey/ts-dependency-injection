import { ShouldBeMockedDependencyError } from '../Errors'
import { ILifetime } from '../Lifetime'
import { ScopedContext } from '../ServiceProvider'
import { PropertyOf, propertyOf } from '../utils'
import { Factory, IServiceCollection, Key } from './IServiceCollection'

export type MockSetup<E> = {
	[key in keyof E]?: Partial<E[key]> | Factory<Partial<E[key]>, E>;
};

export function proxyLifetimes<E>(services: IServiceCollection<E>, mock: MockSetup<E>) {
	const provider = services.build()
	Object.values<ILifetime<unknown, E>>(provider.lifetimes)
		.forEach((lifetime) => {
			const setup = mock[lifetime.name]
			// @ts-ignore
			provider.lifetimes[lifetime.name] = proxyLifetime(lifetime, setup)
		})
	return provider
}

const provide = (propertyOf as PropertyOf<ILifetime>).provide

export function proxyLifetime<E>(lifetime: ILifetime<unknown, E>, mock: MockSetup<E>[Key<E>] | undefined) {
	const name = lifetime.name.toString()
	return new Proxy(lifetime, {
		get(target, prop: keyof ILifetime<unknown, E>) {
			if (prop !== provide) return target[prop]
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
			get(target, prop: Key<T>) {
				if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.get)
					return target[prop]
				throw new ShouldBeMockedDependencyError(name, prop.toString(), 'get')
			},
			set(target, prop: Key<T>, value) {
				if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.set) {
					target[prop] = value
					return true
				}
				throw new ShouldBeMockedDependencyError(name, prop.toString(), 'set')
			},
		},
	) as T
}