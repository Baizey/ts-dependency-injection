import { Keys } from './utils';
import { ServiceProvider } from './index';

export type Factory<T, E> = (provider: ServiceProvider<E>) => T;

export type ProviderValidation = {
  lastSingleton?: string;
  trail: Record<string, boolean>;
};

export type ProviderScope = Record<string, any>;

export type ProviderFactory<E> = (context?: ProviderScope) => ServiceProvider<E>;

export type DependencyConstructor<T, E> =
  | { prototype: T; name: string; new (provider: ServiceProvider<E>): T }
  | { prototype: T; name: string; new (provider: Required<E>): T }
  | { prototype: T; name: string; new (): T };

export type NameSelector<T, E> = string | ((p: Keys<T, Required<E>>) => string);
