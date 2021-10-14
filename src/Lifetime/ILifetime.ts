import { ActualProvider, Factory } from '../types';

export interface ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, E>;

  provide(provider: ActualProvider<E>): T;
}
