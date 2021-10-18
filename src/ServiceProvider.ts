import { NameSelector, ProviderFactory, ProviderScope, ProviderValidation } from './types';
import { IServiceCollection } from './ServiceCollection/IServiceCollection';
import { DependencyErrorType, ErrorTypes } from './Errors/types';
import { CircularDependencyError } from './Errors/CircularDependencyError';
import { ExistenceDependencyError } from './Errors/ExistenceDependencyError';

export type ProviderContext<E> = {
  services: IServiceCollection<E>;
  create: ProviderFactory<E>;
  validation: ProviderValidation;
  scope: ProviderScope;
};

export class InternalServiceProvider<E> {
  readonly _: ProviderContext<E>;

  constructor(
    services: IServiceCollection<E>,
    create: ProviderFactory<E>,
    validation: ProviderValidation,
    context: ProviderScope,
  ) {
    this._ = {
      scope: context,
      validation,
      services,
      create,
    };
  }

  getService<T>(nameSelector: NameSelector<T, E>): T {
    const { services, scope, create } = this._;
    const name = services.resolveProperty(nameSelector);

    try {
      const actual = scope ? (this as unknown as ServiceProvider<E>) : create({});
      const lifetime = services.get<T>(name);
      if (lifetime) return lifetime.provide(actual);
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
    throw new ExistenceDependencyError(name);
  }

  /**
   * Returns a new provider which stays within scope but resets validation
   */
  createScoped(): ServiceProvider<E> {
    const { create, scope } = this._;
    return create(scope);
  }
}

export type ServiceProvider<E> = Required<E> & InternalServiceProvider<E>;
