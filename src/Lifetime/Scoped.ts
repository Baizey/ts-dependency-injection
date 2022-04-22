import { Factory, Key } from '../ServiceCollection';
import { SingletonScopedDependencyError } from '../Errors';
import { ILifetime } from './ILifetime';
import { ScopedContext } from '../ServiceProvider';

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;

  constructor(name: Key<E>, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ScopedContext<E>) {
    const {
      dependencyTracker: { lastSingleton },
      scope,
    } = provider;
    if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton, this.name);

    const value = scope[this.name] ?? this.factory(provider.proxy);

    return (scope[this.name] = value);
  }

  clone(): ILifetime<T, E> {
    return new Scoped(this.name, this.factory);
  }
}
