import { Factory } from '../types';
import { ServiceProvider } from '../ServiceProvider';

export interface ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, Required<E>>;

  provide(provider: ServiceProvider<E>): T;
}
