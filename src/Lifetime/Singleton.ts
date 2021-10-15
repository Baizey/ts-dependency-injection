import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';
import { ServiceProvider } from '../ServiceProvider';

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, E>;
  private value?: T;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<E>) {
    if (this.value) return this.value;

    const {
      _: {
        validation: { validate, trail },
        create,
        scope,
      },
    } = provider;

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      provider = create({ validate, lastSingleton: this.name, trail: { ...trail, [this.name]: true } }, scope);
    }

    return (this.value = this.factory(provider));
  }
}
