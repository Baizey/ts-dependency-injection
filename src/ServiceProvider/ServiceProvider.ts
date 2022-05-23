import { Key, LifetimeCollection, Selector } from '../ServiceCollection'
import { proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'
import { ScopedServiceProvider } from './ScopedServiceProvider'

export class ServiceProvider<E = any> implements IServiceProvider<E> {
	readonly isDone: boolean = false
	readonly depth: number = 0
	readonly root: ServiceProvider<E> = this
	readonly lifetimes: LifetimeCollection<E>
	readonly instances: Record<Key<any>, any> = {}
	readonly proxy: E
	
	constructor(lifetimes: LifetimeCollection<E>) {
		this.lifetimes = lifetimes
		this.proxy = proxyOf(this)
	}
	
	using(action: (provider: E) => any): void {
		new ScopedServiceProvider<E>(this).using(action)
	}
	
	provide<T>(selector: Selector<T, E>): T {
		return new ScopedServiceProvider<E>(this).provide(selector)
	}
}