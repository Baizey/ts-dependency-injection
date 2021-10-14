import { ActualProvider, DependencyProvider } from '../types';

export interface ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;

  provide(provider: ActualProvider<E>): T;
}
