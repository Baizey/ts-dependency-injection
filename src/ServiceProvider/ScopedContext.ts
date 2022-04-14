import { Key, Selector } from '../ServiceCollection/IServiceCollection';
import { ILifetime } from '../Lifetime';
import { CircularDependencyError, ExistenceDependencyError } from '../Errors';
import { ServiceCollection } from '../ServiceCollection';
import { IServiceProvider } from './IServiceProvider';

interface ITrail {
  readonly lookup: Record<Key<any>, boolean>;
  readonly ordered: Key<any>[];
  readonly depth: number;

  add(key: Key<any>): void;

  remove(key: Key<any>): void;

  has(key: Key<any>): boolean;
}

export class Trail implements ITrail {
  readonly lookup: Record<Key<any>, boolean> = {};
  readonly ordered: Key<any>[] = [];

  get depth() {
    return this.ordered.length;
  }

  add(key: Key<any>): void {
    this.ordered.push(key);
    this.lookup[key] = true;
  }

  has(key: Key<any>): boolean {
    return this.lookup[key] ?? false;
  }

  remove(key: Key<any>): void {
    this.ordered.pop();
    delete this.lookup[key];
  }
}

export type ProviderValidation = {
  lastSingleton?: Key<any>;
  trail: Trail;
};
export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E> implements IServiceProvider<E> {
  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly validation: ProviderValidation;
  readonly scope: ProviderScope = {};
  readonly proxy: E;

  constructor(lifetimes: Record<Key<E>, ILifetime<any, E>>) {
    this.lifetimes = lifetimes;

    this.validation = { trail: new Trail() };

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
    if (!lifetime) throw new ExistenceDependencyError(key);

    const { trail } = this.validation;
    if (trail.has(lifetime.name)) throw new CircularDependencyError(lifetime.name, trail.ordered);
    trail.add(lifetime.name);

    const result = lifetime.provide(this);

    trail.remove(lifetime.name);

    return result;
  }
}
