import { Key, Selector } from '../ServiceCollection/IServiceCollection';
import { ILifetime } from '../Lifetime';
import { CircularDependencyError, ExistenceDependencyError } from '../Errors';
import { ServiceCollection } from '../ServiceCollection';
import { IServiceProvider } from './IServiceProvider';

interface IDependencyTracker {
  lastSingleton?: Key<any>;
  readonly depth: number;

  enter(key: Key<any>): void;

  leave(key: Key<any>): void;
}

export class DependencyTracker implements IDependencyTracker {
  private readonly lookup: Record<Key<any>, true> = {};
  private readonly ordered: Key<any>[] = [];

  get depth() {
    return this.ordered.length;
  }

  enter(key: Key<any>): void {
    if (key in this.lookup) throw new CircularDependencyError(key, this.ordered);
    this.ordered.push(key);
    this.lookup[key] = true;
  }

  leave(key: Key<any>): void {
    this.ordered.pop();
    delete this.lookup[key];
  }
}

export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E> implements IServiceProvider<E> {
  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly proxy: E;

  readonly dependencyTracker: IDependencyTracker = new DependencyTracker();
  readonly scope: ProviderScope = {};

  constructor(lifetimes: Record<Key<E>, ILifetime<any, E>>) {
    const self = this;
    this.lifetimes = lifetimes;
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
    if (!lifetime) throw new ExistenceDependencyError(key);

    this.dependencyTracker.enter(lifetime.name);

    const result = lifetime.provide(this);

    this.dependencyTracker.leave(lifetime.name);

    return result;
  }
}
