import { LifetimeCollection, Selector } from '../ServiceCollection'
import { proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'
import { ScopedServiceProvider } from './ScopedServiceProvider'

export class ServiceProvider<E = any> implements IServiceProvider<E> {
	readonly lifetimes: LifetimeCollection<E>
	readonly proxy: E
	readonly root: IServiceProvider<E> = this
	readonly isDone: boolean = false
	readonly depth: number = 0
	
	constructor(lifetimes: LifetimeCollection<E>) {
		this.lifetimes = lifetimes
		this.proxy = proxyOf(this)
	}
	
	using(action: (provider: E) => any): void {
		action(new ScopedServiceProvider(this).proxy)
	}
	
	provide<T>(selector: Selector<T, E>): T {
		return new ScopedServiceProvider<E>(this)
			.provide(selector)
	}
}