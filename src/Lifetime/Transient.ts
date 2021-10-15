import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';
import { ServiceProvider } from '../ServiceProvider';

export class Transient<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, Required<E>>;

  constructor(name: string, factory: Factory<T, Required<E>>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<Required<E>>) {
    const {
      _: {
        validation: { validate, trail, lastSingleton },
        create,
        scope,
      },
    } = provider;

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      provider = create({ validate, lastSingleton, trail: { ...trail, [this.name]: true } }, scope);
    }

    return this.factory(provider);
  }
}
