import { ActualProvider, Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError, SingletonScopedDependencyError } from '../Errors';

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, Required<E>>;

  constructor(name: string, factory: Factory<T, Required<E>>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ActualProvider<Required<E>>) {
    const {
      _: {
        validation: { validate, lastSingleton, trail },
        create,
        context,
      },
    } = provider;

    if (context[this.name]) return context[this.name];

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton, this.name);
      provider = create({ validate, lastSingleton, trail: { ...trail, [this.name]: true } }, context);
    }

    return (context[this.name] = this.factory(provider));
  }
}
