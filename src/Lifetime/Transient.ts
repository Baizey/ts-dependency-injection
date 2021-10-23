import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { ServiceProvider } from '../ServiceProvider';
import { CircularDependencyError } from '../Errors/CircularDependencyError';

export class Transient<T, E> implements ILifetime<T, E> {
  readonly name: string;
  factory: Factory<T, E>;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<E>) {
    const {
      _: {
        validation: { trail },
      },
    } = provider;

    // Handle errors
    if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);

    // Pre-calling factory
    trail[this.name] = true;

    // Calling factory
    const value = this.factory(provider);

    // Post-calling factory
    delete trail[this.name];

    return value;
  }
}
