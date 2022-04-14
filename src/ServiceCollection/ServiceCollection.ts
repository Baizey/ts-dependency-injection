import { ILifetime, Scoped, Singleton, Transient } from '../Lifetime';
import { DuplicateDependencyError, ShouldBeMockedDependencyError } from '../Errors';
import { IServiceProvider, ServiceProvider } from '../ServiceProvider';
import {
  DependencyOptions,
  Factory,
  FunctionSelector,
  IServiceCollection,
  Key,
  LifetimeConstructor,
  Selector,
} from './IServiceCollection';
import { ScopedContext } from '../ServiceProvider/ScopedContext';

export type RecordCollection<E> = Record<Key<E>, ILifetime<unknown, E>>;

export class ServiceCollection<E = any> implements IServiceCollection<E> {
  private readonly lifetimes: RecordCollection<E> = {} as RecordCollection<E>;

  addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Singleton, options, selector);
  }

  addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Transient, options, selector);
  }

  addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Scoped, options, selector);
  }

  add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    const name = ServiceCollection.extractSelector(selector);
    if (name in this.lifetimes) throw new DuplicateDependencyError(name);
    const factory = this.extractDependency(dependency);
    this.lifetimes[name] = new Lifetime(name, factory);
  }

  get<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
    const key = ServiceCollection.extractSelector(selector);
    return this.lifetimes[key] as ILifetime<T, E>;
  }

  remove<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
    const result = this.get(selector);
    if (result) delete this.lifetimes[result.name];
    return result;
  }

  private extractDependency<T>(Option: DependencyOptions<T, E>): Factory<T, E> {
    if (typeof Option === 'function') return (p) => new Option(p);
    return Option.factory;
  }

  static extractSelector<T, E>(options: Selector<T, E>): Key<E> {
    switch (typeof options) {
      case 'function':
        const proxy = new Proxy({}, { get: (t, p) => p.toString() }) as FunctionSelector<T, E>;
        return options(proxy);
      case 'symbol':
        return options.toString() as Key<E>;
      case 'string':
        return options;
      case 'object':
        return options.name;
      default:
        throw new Error(`Name selector could not match anything`);
    }
  }

  build(): IServiceProvider<E> {
    const lifetimes = this.cloneLifetimes();
    return new ServiceProvider<E>(lifetimes);
  }

  buildMock(mock?: {
    [key in keyof E]?: (mockedValue: Required<E>[key], provider: IServiceProvider<E>) => void;
  }): IServiceProvider<E> {
    const provider = this.build();
    Object.entries<ILifetime<unknown, E>>(provider.lifetimes)
      .map(([key, value]) => ({
        name: key as Key<E>,
        lifetime: value,
      }))
      .forEach(({ name, lifetime }) => {
        const valueProxy = new Proxy(
          {},
          {
            get(target, prop) {
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'function');
            },
          },
        ) as any;

        provider.lifetimes[name] = new Proxy(lifetime, {
          get(target, prop: keyof ILifetime<unknown, E>) {
            if (prop !== 'provide') return target[prop];
            return (context: ScopedContext<E>) => {
              const depth = Object.keys(context.validation.trail).length;
              if (depth === 0) return target.provide(context);

              const mockSetup = mock && mock[name];
              if (mockSetup) mockSetup(valueProxy, context);
              return valueProxy;
            };
          },
        });
      });

    return provider;
  }

  private cloneLifetimes(): RecordCollection<E> {
    return Object.entries(this.lifetimes)
      .map(([key, value]) => ({
        name: key as Key<E>,
        lifetime: (value as ILifetime<unknown, E>).clone(),
      }))
      .reduce((a, { name, lifetime }) => {
        a[name] = lifetime;
        return a;
      }, {} as RecordCollection<E>);
  }
}
