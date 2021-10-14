import { ActualProvider, DependencyProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';

export class Transient<T, E> implements ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;
  private readonly factory: Factory<T, E>;

  constructor(dependency: DependencyProvider<T, E>, providerName: string, factory: Factory<T, E>) {
    this.dependency = dependency;
    this.providerName = providerName;
    this.factory = factory;
  }

  provide(originalProvider: ActualProvider<E>) {
    const {
      _: {
        validation: { validate, trail, singletonBlockingScope },
        create,
        context,
      },
    } = originalProvider;

    let provider = originalProvider;

    if (validate) {
      if (trail[this.providerName]) throw new CircularDependencyError(this.providerName, this.providerName);
      provider = create(
        { validate, singletonBlockingScope, trail: { ...trail, [this.providerName]: this.providerName } },
        context,
      );
    }

    return this.factory(provider);
  }
}
