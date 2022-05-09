import { Key, Selector, ServiceCollection } from "../ServiceCollection";
import { ILifetime } from "../Lifetime";
import { CircularDependencyError, ExistenceDependencyError } from "../Errors";
import { IServiceProvider } from "./IServiceProvider";

export interface IDependencyTracker {
  readonly last: ILifetime<any, any> | undefined;
  readonly depth: number;

  readonly singleton?: ILifetime<any, any>;

  enter(lifetime: ILifetime<any, any>): void;

  leave(lifetime: ILifetime<any, any>): void;

  traverseOnto(other: IDependencyTracker): void;

  clone(): IDependencyTracker;
}

export class DependencyTracker implements IDependencyTracker {
  private readonly singletons: ILifetime<any, any>[] = [];
  private readonly lookup: Record<Key<any>, ILifetime<any, any>> = {};
  private readonly ordered: ILifetime<any, any>[] = [];

  get depth() {
    return this.ordered.length;
  }

  get singleton() {
    if (this.singletons.length === 0) return undefined;
    return this.singletons[this.singletons.length - 1];
  }

  get last() {
    if (this.ordered.length === 0) return undefined;
    return this.ordered[this.ordered.length - 1];
  }

  enter(lifetime: ILifetime<any, any>): void {
    if (lifetime.name in this.lookup) throw new CircularDependencyError(lifetime.name, this.ordered.map(e => e.name));
    this.ordered.push(lifetime);
    if (lifetime.isSingleton) this.singletons.push(lifetime);
    this.lookup[lifetime.name] = lifetime;
  }

  leave(lifetime: ILifetime<any, any>): void {
    const last = this.ordered.pop();
    if (last?.isSingleton) this.singletons.pop();
    delete this.lookup[lifetime.name];
  }

  traverseOnto(other: IDependencyTracker) {
    this.ordered.forEach(e => other.enter(e));
  }

  clone() {
    const clone = new DependencyTracker();
    this.ordered.forEach(e => clone.enter(e));
    return clone;
  }
}

export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E> implements IServiceProvider<E> {
  readonly dependencyTracker: IDependencyTracker;
  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly proxy: E;
  readonly scope: ProviderScope;
  private parent: IServiceProvider<E>;

  constructor(parent: IServiceProvider<E>) {
    this.parent = parent;
    this.dependencyTracker = new DependencyTracker();
    if (parent instanceof ScopedContext) {
      this.scope = parent.scope;
      parent.dependencyTracker.traverseOnto(this.dependencyTracker);
    } else {
      this.scope = {};
    }

    const self = this;
    this.lifetimes = parent.lifetimes;
    this.proxy = new Proxy(
      {},
      {
        get: (target, prop: Key<E>) => self.provide(prop)
      }
    ) as E;
  }

  provide<T>(selector: Selector<T, E>): T {
    const key = ServiceCollection.extractSelector(selector);
    const lifetime = this.lifetimes[key];
    if (!lifetime) throw new ExistenceDependencyError(key);

    this.dependencyTracker.enter(lifetime);

    const result = lifetime.provide(this);

    this.dependencyTracker.leave(lifetime);

    return result;
  }

  clone(): ScopedContext<E> {
    return new ScopedContext(this);
  }
}