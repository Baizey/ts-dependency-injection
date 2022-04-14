import { Factory, Key } from '../IServiceCollection';
import { ScopedContext } from '../IServiceProvider';
import { ILifetime } from './ILifetime';

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;
  private value?: T;

  constructor(name: Key<E>, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(context: ScopedContext<E>) {
    if (this.value) return this.value;

    const old = context.validation.lastSingleton;
    context.validation.lastSingleton = this.name;

    const value = this.factory(context.proxy);

    context.validation.lastSingleton = old;

    return (this.value = value);
  }
}
