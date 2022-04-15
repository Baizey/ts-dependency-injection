import { Factory, Key } from '../ServiceCollection/IServiceCollection';
import { ILifetime } from './ILifetime';
import { ScopedContext } from '../ServiceProvider/ScopedContext';

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

    const old = context.dependencyTracker.lastSingleton;
    context.dependencyTracker.lastSingleton = this.name;

    const value = this.factory(context.proxy);

    context.dependencyTracker.lastSingleton = old;

    return (this.value = value);
  }

  clone(): ILifetime<T, E> {
    return new Singleton(this.name, this.factory);
  }
}
