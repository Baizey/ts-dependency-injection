import { Key, LifetimeCollection, Selector } from '../ServiceCollection'
import { ServiceProvider } from './ServiceProvider'

export interface IServiceProvider<E = any> {
	readonly proxy: E
	readonly lifetimes: LifetimeCollection<E>
	readonly isDone: boolean
	readonly depth: number
	readonly root: ServiceProvider<E>
	readonly instances: Record<Key<any>, any>
	
	provide<T>( selector: Selector<T, E> ): T
	
	using( action: ( provider: E ) => any ): void
}