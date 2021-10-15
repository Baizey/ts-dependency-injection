import { DependencyConstructor, Factory, NameSelector } from '../types';
import { ILifetime } from '../Lifetime';

export type LifetimeConstructor<T, E> = new (name: string, factoryFunction: Factory<T, Required<E>>) => ILifetime<T, E>;

export type ProviderConstructor<E> = { prototype: E; name: string; new (): E };

export type DependencyOptions<T, E> =
  | {
      dependency?: undefined;
      factory: Factory<T, E>;
      selector: NameSelector<T, Required<E>>;
    }
  | {
      dependency: DependencyConstructor<T, Required<E>>;
      selector: NameSelector<T, Required<E>>;
    }
  | DependencyConstructor<T, Required<E>>;
