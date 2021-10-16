import { NameSelector } from '../types';
import { ProviderContext } from './types';

export interface IServiceProvider<E> {
  readonly _: ProviderContext<E>;

  getService<T>(nameSelector: NameSelector<T, E>): T;
}
