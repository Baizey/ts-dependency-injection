import { LifetimeCollection, Selector } from '../ServiceCollection'

export interface IServiceProvider<E = any> {
	readonly proxy: E
	readonly lifetimes: LifetimeCollection<E>
	
	provide<T>(selector: Selector<T, E>): T
}