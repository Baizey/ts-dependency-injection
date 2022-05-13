import { ILifetime } from '../Lifetime'
import { Key, Selector } from '../ServiceCollection'
import { proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'
import { ScopedContext } from './ScopedContext'

export class ServiceProvider<E = any> implements IServiceProvider<E> {
	readonly lifetimes: Record<Key<E>, ILifetime<any, E>>
	readonly proxy: E
	
	constructor(lifetimes: Record<Key<E>, ILifetime<any, E>>) {
		this.lifetimes = lifetimes
		this.proxy = proxyOf(this)
	}
	
	provide<T>(selector: Selector<T, E>): T {
		return new ScopedContext<E>(this).provide(selector)
	}
}