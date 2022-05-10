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

  provide(context: ScopedContext<E>) {
    const {
      lastSingleton,
      scope
    } = context;
    if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton.name, this.name);

    const value = scope[this.name] ?? this.factory(context.proxy, context);

    return (scope[this.name] = value);
  }

  clone(): ILifetime<T, E> {
    return new Scoped(this.name, this.factory);
  }
}