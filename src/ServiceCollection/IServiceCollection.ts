import { DependencyOptions, LifetimeConstructor } from './types';
import { DependencyConstructor, NameSelector } from '../types';
import { ILifetime } from '../Lifetime';
import { ServiceProvider } from '../ServiceProvider';

export interface IServiceCollection<E> {
  readonly template: Required<E>;

  add<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): void;

  tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): boolean;

  get<T>(item: NameSelector<T, E>): ILifetime<T, E> | undefined;

  replace<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): void;

  remove<T>(item: NameSelector<T, E>): boolean;

  build(validate?: boolean): ServiceProvider<E>;

  validate(): void;

  resolveProperty<T>(item?: NameSelector<T, E>, dependency?: DependencyConstructor<T, E>): string;

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
