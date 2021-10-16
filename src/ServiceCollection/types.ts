import { DependencyConstructor, Factory, NameSelector } from '../types';
import { ILifetime } from '../Lifetime';

export type LifetimeConstructor<T, E> = new (name: string, factoryFunction: Factory<T, E>) => ILifetime<T, E>;

export type ProviderConstructor<E> = { prototype: E; name: string; new (): E };

export type DependencyOptions<T, E> =
  | {
      dependency?: undefined;
      factory: Factory<T, E>;
      selector: NameSelector<T, E>;
    }
  | {
      dependency: DependencyConstructor<T, E>;
      selector: NameSelector<T, E>;
    }
  | DependencyConstructor<T, E>;
