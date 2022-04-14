import { ILifetime } from '../Lifetime';
import { IServiceProvider } from '../ServiceProvider';

export type Key<E> = keyof E & (string | symbol);

export type WantedKeys<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E];
export type FunctionSelector<T, E> = { [key in WantedKeys<T, E>]: key & string };
export type Selector<T, E> =
  | (keyof E & (string | symbol))
  | ((e: FunctionSelector<T, E>) => keyof E & string)
  | {
      name: keyof E & string;
      prototype: T;
    };

export type Factory<T, E> = (provider: E) => T;
export type DependencyConstructor<T, E> = { new (props: E): T } | { new (): T };
export type DependencyOptions<T, E> = { factory: Factory<T, E> } | DependencyConstructor<T, E>;

export type LifetimeConstructor<T, E> = new (name: Key<E>, factory: Factory<T, E>) => ILifetime<T, E>;

export interface IServiceCollection<E> {
  addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  get<T>(item: Selector<T, E>): ILifetime<T, E> | undefined;

  remove<T>(item: Selector<T, E>): ILifetime<T, E> | undefined;

  build(): IServiceProvider<E>;
}
