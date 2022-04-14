import { Key, Selector } from '../ServiceCollection/IServiceCollection';
import { ILifetime } from '../Lifetime';
import { IServiceProvider } from './IServiceProvider';
import { ScopedContext } from './ScopedContext';

export class ServiceProvider<E> implements IServiceProvider<E> {
  readonly lifetimes: Record<Key<E>, ILifetime<any, E>>;
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
