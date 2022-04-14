import { Factory, Key } from '../IServiceCollection';
import { ScopedContext } from '../IServiceProvider';
import { ILifetime } from './ILifetime';

export class Transient<T, E> implements ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;

  constructor(name: Key<E>, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(context: ScopedContext<E>) {
    return this.factory(context.proxy);
  }
}
