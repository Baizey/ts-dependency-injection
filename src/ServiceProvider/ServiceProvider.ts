import { IServiceCollection } from '../ServiceCollection';
import { NameSelector, ProviderFactory, ProviderScope, ProviderValidation } from '../types';
import { CircularDependencyError, DependencyErrorType, ErrorTypes } from '../Errors';
import { ProviderContext } from './types';
import { IServiceProvider } from './IServiceProvider';

export class InternalServiceProvider<E> implements IServiceProvider<E> {
  readonly _: ProviderContext<E>;

  constructor(
    container: IServiceCollection<E>,
    create: ProviderFactory<E>,
    validation: ProviderValidation,
    context: ProviderScope,
  ) {
    this._ = {
      scope: context,
      validation,
      container,
      create,
    };
  }

  getService<T>(nameSelector: NameSelector<T, Required<E>>): T {
    const { container, scope, create, validation } = this._;
    const name = container.resolveProperty(nameSelector);

    try {
      const actual = scope ? (this as unknown as ServiceProvider<E>) : create(validation, {});
      return container.get(name)?.provide(actual) as T;
    } catch (e) {
      const error = e as ErrorTypes;
      switch (error.type) {
        case DependencyErrorType.Circular:
          // When error is detected we can only say lifetime === cause
          // Letting it throw 1 dependency up we can find the dependencies causing the issue
          if (error.lifetime !== error.cause) throw e;
          throw new CircularDependencyError(error.lifetime, name);
        default:
          throw e;
      }
    }
  }
}

export type ServiceProvider<E> = Required<E> & InternalServiceProvider<E>;
