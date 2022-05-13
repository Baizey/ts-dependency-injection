import { RecordCollection, Selector } from '../ServiceCollection'

export interface IServiceProvider<E = any> {
	readonly proxy: E
	readonly lifetimes: RecordCollection<E>
	
	provide<T>(selector: Selector<T, E>): T
}