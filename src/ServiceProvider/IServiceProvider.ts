import { Key, Selector } from '../ServiceCollection/IServiceCollection';
import { RecordCollection } from '../ServiceCollection/ServiceCollection';

export type ProviderValidation = {
  lastSingleton?: Key<any>;
  trail: Record<Key<any>, boolean>;
};
export type ProviderScope = Record<Key<any>, any>;

export interface IServiceProvider<E> {
  readonly proxy: E;
  readonly lifetimes: RecordCollection<E>;

  provide<T>(selector: Selector<T, E>): T;
}
