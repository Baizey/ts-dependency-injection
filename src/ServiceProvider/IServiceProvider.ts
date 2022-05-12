import { RecordCollection, Selector } from '../ServiceCollection'

export interface IServiceProvider<E> {
  readonly proxy: E
  readonly lifetimes: RecordCollection<E>
  
  provide<T>(selector: Selector<T, E>): T
}