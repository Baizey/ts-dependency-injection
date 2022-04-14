import { ILifetime } from './Lifetime';
import { Key, Selector, ServiceCollection } from './IServiceCollection';
import { UnknownDependencyError } from '../Errors/UnknownDependencyError';
import { ProviderScope, ProviderValidation } from '../types';
import { CircularDependencyError } from '../Errors/CircularDependencyError';

export interface IServiceProvider<E> {
  readonly proxy: E;

  provide<T>(selector: Selector<T, E>): T;
}

export class ServiceProvider<E> implements IServiceProvider<E> {
  private readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly proxy: E;

  constructor(lifetimes: Record<Key<E>, ILifetime<any, E>>) {
    this.lifetimes = lifetimes;
    const self = this;
    this.proxy = new Proxy(
      {},
      {
        get: (target, prop: Key<E>) => self.provide(prop),
      },
    ) as E;
  }

  provide<T>(selector: Selector<T, E>): T {
    const context = new ScopedContext<E>(this.lifetimes);
    return context.provide(selector);
  }
}

export class ScopedContext<E> implements IServiceProvider<E> {
  private readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly validation: ProviderValidation = { trail: {} };
  readonly scope: ProviderScope = {};
  readonly proxy: E;

  constructor(lifetimes: Record<Key<E>, ILifetime<any, E>>) {
    this.lifetimes = lifetimes;
    const self = this;
    this.proxy = new Proxy(
      {},
      {
        get: (target, prop: Key<E>) => self.provide(prop),
      },
    ) as E;
  }

  provide<T>(selector: Selector<T, E>): T {
    const key = ServiceCollection.extractSelector(selector);
    const lifetime = this.lifetimes[key];
    if (!lifetime) throw new UnknownDependencyError(key);

    const { trail } = this.validation;
    if (trail[lifetime.name]) throw new CircularDependencyError(lifetime.name, lifetime.name);
    trail[lifetime.name] = true;

    const result = lifetime.provide(this);

    delete trail[lifetime.name];

    return result;
  }
}
