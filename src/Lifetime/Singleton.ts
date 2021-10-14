import { ActualProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, E>;
  private value?: T;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ActualProvider<E>) {
    if (this.value) return this.value;

    const {
      _: {
        validation: { validate, trail },
        create,
        context,
      },
    } = provider;

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      provider = create({ validate, lastSingleton: this.name, trail: { ...trail, [this.name]: true } }, context);
    }

    return (this.value = this.factory(provider));
  }
}
