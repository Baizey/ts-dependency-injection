import { Selector } from '../ServiceCollection';
import { RecordCollection } from '../ServiceCollection/ServiceCollection';

export interface IServiceProvider<E> {
  readonly proxy: E;
  readonly lifetimes: RecordCollection<E>;

  provide<T>(selector: Selector<T, E>): T;
}
