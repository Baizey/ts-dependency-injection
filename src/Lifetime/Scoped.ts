import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { ServiceProvider } from '../ServiceProvider';
import { SingletonScopedDependencyError } from '../Errors/SingletonScopedDependencyError';
import { CircularDependencyError } from '../Errors/CircularDependencyError';

export class Scoped<T, E> implements ILifetime<T, E> {
  readonly name: string;
  readonly factory: Factory<T, E>;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<E>) {
    const {
      _: {
        validation: { trail, lastSingleton },
        scope,
      },
    } = provider;

    // If already provided, simply  return old instance
    if (scope[this.name]) return scope[this.name];

    // Handle errors
    if (lastSingleton) throw new SingletonScopedDependencyError(lastSingleton, this.name);
    if (trail[this.name]) throw new CircularDependencyError(this.name, this.name);

    // Pre-calling factory
    trail[this.name] = true;

    // Calling factory
    const value = this.factory(provider);

    // Post-calling factory
    delete trail[this.name];

    return (scope[this.name] = value);
  }
}
