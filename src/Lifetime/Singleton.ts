import { Factory } from '../types';
import { ILifetime } from './ILifetime';
import { ServiceProvider } from '../ServiceProvider';
import { CircularDependencyError } from '../Errors/CircularDependencyError';

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly name: string;
  factory: Factory<T, E>;
  private value?: T;

  constructor(name: string, factory: Factory<T, E>) {
    this.name = name;
    this.factory = factory;
  }

  provide(provider: ServiceProvider<E>) {
    // If already provided, simply  return old instance
    if (this.value) return this.value;

    const {
      _: { validation },
    } = provider;

    // Handle errors
    if (validation.trail[this.name]) throw new CircularDependencyError(this.name, this.name);

    // Pre-calling factory
    const old = validation.lastSingleton;
    validation.lastSingleton = this.name;
    validation.trail[this.name] = true;

    // Calling factory
    const value = this.factory(provider);

    // Post calling factory
    validation.lastSingleton = old;
    delete validation.trail[this.name];

    return (this.value = value);
  }
}
