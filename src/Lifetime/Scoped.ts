import { ActualProvider, DependencyProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError, SingletonScopedDependencyError } from '../Errors';

export class Scoped<T, E> implements ILifetime<T, E> {
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
        validation: { validate, singletonBlockingScope, trail },
        create,
        context,
      },
    } = originalProvider;

    if (context[this.providerName]) return context[this.providerName];

    let provider = originalProvider;

    if (validate) {
      if (trail[this.providerName]) throw new CircularDependencyError(this.providerName, this.providerName);
      if (singletonBlockingScope) throw new SingletonScopedDependencyError(singletonBlockingScope, this.providerName);
      provider = create(
        { validate, singletonBlockingScope, trail: { ...trail, [this.providerName]: this.providerName } },
        context,
      );
    }

    return (context[this.providerName] = this.factory(provider));
  }
}
