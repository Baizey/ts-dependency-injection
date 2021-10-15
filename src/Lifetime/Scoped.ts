import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { CircularDependencyError, SingletonScopedDependencyError } from '../Errors';
import { ServiceProvider } from '../ServiceProvider';

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, Required<E>>;

  constructor(name: string, factory: Factory<T, Required<E>>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<Required<E>>) {
    const {
      _: {
        validation: { validate, lastSingleton, trail },
        create,
        scope,
      },
    } = provider;

    if (scope[this.name]) return scope[this.name];

    if (validate) {
      if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);
      if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton, this.name);
      provider = create({ validate, lastSingleton, trail: { ...trail, [this.name]: true } }, scope);
    }

    return (scope[this.name] = this.factory(provider));
  }
}
