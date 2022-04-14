import { Factory, Key } from '../IServiceCollection';
import { ScopedContext } from '../IServiceProvider';
import { SingletonScopedDependencyError } from '../../Errors/SingletonScopedDependencyError';
import { ILifetime } from './ILifetime';

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly name: Key<E>;
  factory: Factory<T, E>;

  constructor(name: Key<E>, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ScopedContext<E>) {
    const {
      validation: { lastSingleton },
      scope,
    } = provider;
    if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton, this.name);

    const value = scope[this.name] ?? this.factory(provider.proxy);

    return (scope[this.name] = value);
  }
}
