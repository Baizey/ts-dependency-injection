import { LifetimeCollection, Selector } from '../ServiceCollection'

export interface IServiceProvider<E = any> {
	readonly root: IServiceProvider<E>
	readonly proxy: E
	readonly lifetimes: LifetimeCollection<E>
	readonly isDone: boolean
	readonly depth: number
	
	provide<T>(selector: Selector<T, E>): T
}