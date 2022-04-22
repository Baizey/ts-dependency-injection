import { Factory, Key } from '../ServiceCollection';
import { ILifetime } from './ILifetime';
import { ScopedContext } from '../ServiceProvider';

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

  clone(): ILifetime<T, E> {
    return new Transient(this.name, this.factory);
  }
}
