import { ActualProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError } from '../Errors';

export class Transient<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, E>;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ActualProvider<E>) {
    const {
      _: {
        validation: { validate, trail, lastSingleton },
        create,
        context,
      },
    } = provider;

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      provider = create({ validate, lastSingleton, trail: { ...trail, [this.name]: true } }, context);
    }

    return this.factory(provider);
  }
}
