import { DependencyOptions, LifetimeConstructor } from './types';
import { DependencyConstructor, NameSelector } from '../types';
import { ILifetime } from '../Lifetime';
import { ServiceProvider } from '../ServiceProvider';

export interface IServiceCollection<E> {
  readonly template: Required<E>;

  add<T>(Lifetime: LifetimeConstructor<T, Required<E>>, options: DependencyOptions<T, Required<E>>): void;

  tryAdd<T>(Lifetime: LifetimeConstructor<T, Required<E>>, options: DependencyOptions<T, Required<E>>): boolean;

  get<T>(item: NameSelector<T, E>): ILifetime<T, E> | undefined;

  replace<T>(Lifetime: LifetimeConstructor<T, Required<E>>, options: DependencyOptions<T, Required<E>>): void;

  remove<T>(item: NameSelector<T, Required<E>>): boolean;

  build(validate?: boolean): ServiceProvider<E>;

  validate(): void;

  resolveProperty<T>(item?: NameSelector<T, Required<E>>, dependency?: DependencyConstructor<T, Required<E>>): string;

  addSingleton<T>(options: DependencyOptions<T, E>): void;

  addScoped<T>(options: DependencyOptions<T, E>): void;

  addTransient<T>(options: DependencyOptions<T, E>): void;

  tryAddSingleton<T>(options: DependencyOptions<T, E>): boolean;

  tryAddScoped<T>(options: DependencyOptions<T, E>): boolean;

  tryAddTransient<T>(options: DependencyOptions<T, E>): boolean;

  replaceSingleton<T>(options: DependencyOptions<T, E>): void;

  replaceScoped<T>(options: DependencyOptions<T, E>): void;

  replaceTransient<T>(options: DependencyOptions<T, E>): void;
}
