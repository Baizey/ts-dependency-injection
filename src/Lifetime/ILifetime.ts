import { Factory, Key } from "../ServiceCollection";
import { ScopedContext } from "../ServiceProvider";

export interface ILifetime<T, E> {
  readonly isSingleton: boolean;
  readonly name: Key<E>;
  factory: Factory<T, E>;

  provide(context: ScopedContext<E>): T;

  clone(): ILifetime<T, E>;
}