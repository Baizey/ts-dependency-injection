import { Key, Selector, ServiceCollection } from "../ServiceCollection";
import { DependencyInfo, ILifetime } from "../Lifetime";
import { CircularDependencyError, ExistenceDependencyError } from "../Errors";
import { IServiceProvider } from "./IServiceProvider";

export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E> implements IServiceProvider<E> {
  private readonly singletons: DependencyInfo[] = [];
  private readonly lookup: Record<Key<any>, DependencyInfo> = {};
  private readonly ordered: DependencyInfo[] = [];

  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
  readonly proxy: E;
  readonly scope: ProviderScope;

  constructor(parent: IServiceProvider<E>) {
    const self = this;
    this.lifetimes = parent.lifetimes;
    this.scope = (parent instanceof ScopedContext) ? parent.scope : {};
    this.proxy = new Proxy(
      {},
      {
        get: (target, prop: Key<E>) => self.provide(prop)
      }
    ) as E;
  }

  get depth() {
    return this.ordered.length;
  }

  get lastSingleton() {
    return this.singletons[this.singletons.length - 1];
  }

  enter(lifetime: DependencyInfo) {
    if (lifetime.name in this.lookup) throw new CircularDependencyError(lifetime.name, this.ordered.map(e => e.name));
    this.ordered.push(lifetime);
    if (lifetime.isSingleton) this.singletons.push(lifetime);
    this.lookup[lifetime.name] = lifetime;
  }

  leave(lifetime: DependencyInfo) {
    const last = this.ordered.pop();
    if (last?.isSingleton) this.singletons.pop();
    delete this.lookup[lifetime.name];
  }

  provide<T>(selector: Selector<T, E>): T {
    const key = ServiceCollection.extractSelector(selector);
    const lifetime = this.lifetimes[key];
    if (!lifetime) throw new ExistenceDependencyError(key);

    this.enter(lifetime);

    const result = lifetime.provide(this);

    this.leave(lifetime);

    return result;
  }
}