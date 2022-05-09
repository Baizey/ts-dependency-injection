import { Factory, Key } from "../ServiceCollection";
import { SingletonScopedDependencyError } from "../Errors";
import { ILifetime } from "./ILifetime";
import { ScopedContext } from "../ServiceProvider";

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly isSingleton = false;
  readonly name: Key<E>;
  factory: Factory<T, E>;

  constructor(name: Key<E>, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ScopedContext<E>) {
    const {
      dependencyTracker: { singleton },
      scope
    } = provider;
    if (singleton) throw new SingletonScopedDependencyError(singleton.name, this.name);

    const value = scope[this.name] ?? this.factory(provider.proxy, provider);

    return (scope[this.name] = value);
  }

  clone(): ILifetime<T, E> {
    return new Scoped(this.name, this.factory);
  }
}