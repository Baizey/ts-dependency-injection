import { Keys } from './utils';
import { InternalProvider } from './InternalProvider';

export type Factory<T, E> = (provider: E) => T;

export type ProviderValidation<E> = {
  lastSingleton?: string;
  trail: Record<string, boolean>;
  validate: boolean;
};

export type ProviderContext<E> = Record<string, any>;

export type ProviderCreator<E> = (validation: ProviderValidation<E>, context: ProviderContext<E>) => ActualProvider<E>;

export type ActualProvider<E> = E & InternalProvider<E>;

export type DependencyProvider<T, E> =
  | { prototype: T; name: string; new (provider: E): T }
  | { prototype: T; name: string; new (): T };

export type NameSelector<T, E> = string | ((p: Keys<T, E>) => string);
