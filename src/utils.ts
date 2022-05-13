import { Key, Selector } from './ServiceCollection'
import { IServiceProvider } from './ServiceProvider'

export type PropertyOf<E> = Required<{ [key in keyof E]: key & Key<E> }>

export const propertyOf = new Proxy({}, { get: (_, p) => p }) as any

export const proxyOf = <E>(self: IServiceProvider<E>) =>
	new Proxy(self, { get: (t, p: Key<E>) => t.provide(p) }) as unknown as E

export function extractSelector<T, E>(options: Selector<T, E>): Key<E> {
	switch (typeof options) {
		case 'function':
			return options(propertyOf)
		case 'symbol':
		case 'string':
			return options
		default:
			throw new Error(`extractSelector could not match anything`)
	}
}