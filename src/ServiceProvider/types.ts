import { IServiceCollection } from '../ServiceCollection';
import { ProviderFactory, ProviderScope, ProviderValidation } from '../types';

export type ProviderContext<E> = {
  container: IServiceCollection<E>;
  create: ProviderFactory<E>;
  validation: ProviderValidation;
  scope: ProviderScope;
};
