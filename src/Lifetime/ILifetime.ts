import { Factory, Key } from '../ServiceCollection/IServiceCollection';
import { ScopedContext } from '../ServiceProvider/ScopedContext';

export interface ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;

  provide(context: ScopedContext<E>): T;

  clone(): ILifetime<T, E>;
}
