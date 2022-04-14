import { Factory, Key } from '../IServiceCollection';
import { ScopedContext } from '../IServiceProvider';

export interface ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;

  provide(context: ScopedContext<E>): T;
}
