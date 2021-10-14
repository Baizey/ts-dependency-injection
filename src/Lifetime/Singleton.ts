import { ActualProvider, DependencyProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;
  private value?: T;
  private readonly factory: Factory<T, E>;

  constructor(dependency: DependencyProvider<T, E>, providerName: string, factory: Factory<T, E>) {
    this.dependency = dependency;
    this.providerName = providerName;
    this.factory = factory;
  }

  provide(originalProvider: ActualProvider<E>) {
    if (this.value) return this.value;

    const {
      _: {
        validation: { validate, trail },
        create,
        context,
      },
    } = originalProvider;

    let provider = originalProvider;

    if (validate) {
      if (trail[this.providerName]) throw new CircularDependencyError(this.providerName, this.providerName);
      provider = create(
        {
          validate,
          singletonBlockingScope: this.providerName,
          trail: { ...trail, [this.providerName]: this.providerName },
        },
        context,
      );
    }

    return (this.value = this.factory(provider));
  }
}
