import { ActualProvider, Factory } from '../types';

export interface ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, Required<E>>;

  provide(provider: ActualProvider<Required<Required<E>>>): T;
}
