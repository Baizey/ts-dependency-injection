import { Key, Selector } from '../ServiceCollection/IServiceCollection';
import { ILifetime } from '../Lifetime';
import { CircularDependencyError, UnknownDependencyError } from '../Errors';
import { IServiceProvider, ProviderScope, ProviderValidation } from './IServiceProvider';
import { ServiceCollection } from '../ServiceCollection';

export class ScopedContext<E> implements IServiceProvider<E> {
  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
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
