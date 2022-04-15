import { ILifetime, Scoped, Singleton, Transient } from '../Lifetime';
import { DependencyErrorType, DuplicateDependencyError, ShouldBeMockedDependencyError } from '../Errors';
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

export type MockSetup<E> = {
  [key in keyof E]?: Partial<Required<E>[key]> | Factory<E[key], E>;
};

export type RecordCollection<E> = Record<Key<E>, ILifetime<unknown, E>>;

export class ServiceCollection<E = any> implements IServiceCollection<E> {
  private readonly lifetimes: RecordCollection<E> = {} as RecordCollection<E>;

  replaceSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Singleton, options, selector);
  }

  replaceTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Transient, options, selector);
  }

  replaceScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Scoped, options, selector);
  }

  replace<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.remove(selector);
    this.add(Lifetime, dependency, selector);
  }

  tryAddSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Singleton, options, selector);
  }

  tryAddTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Transient, options, selector);
  }

  tryAddScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Scoped, options, selector);
  }

  tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
    try {
      this.add(Lifetime, dependency, selector);
    } catch (e) {
      const type = (e as DuplicateDependencyError).type;
      if (type !== DependencyErrorType.Duplicate) throw e;
    }
  }

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

  buildMock(mock?: MockSetup<E>): IServiceProvider<E> {
    const provider = this.build();
    Object.entries<ILifetime<unknown, E>>(provider.lifetimes)
      .map(([key, value]) => ({
        name: key as Key<E>,
        lifetime: value,
      }))
      .forEach(({ name, lifetime }) => {
        const mockSetup = mock && mock[name];
        const valueProxy = new Proxy(
          {},
          {
            construct(target, prop) {
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'construct');
            },
            apply(target, prop) {
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'apply');
            },
            get(target, prop) {
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'get');
            },
            set(target, prop) {
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'set');
            },
          },
        ) as any;

        provider.lifetimes[name] = new Proxy(lifetime, {
          get(target, prop: keyof ILifetime<unknown, E>) {
            if (prop !== 'provide') return target[prop];
            return (context: ScopedContext<E>) => {
              if (context.dependencyTracker.depth === 1) return target.provide(context);
              switch (typeof mockSetup) {
                case 'undefined':
                  return valueProxy;
                case 'function':
                  return mockSetup(context.proxy);
                default:
                  return mockSetup;
              }
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
