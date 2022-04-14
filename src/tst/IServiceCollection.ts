import { DuplicateDependencyError } from '../Errors/DuplicateDependencyError';
import { ILifetime, Scoped, Singleton, Transient } from './Lifetime';
import { IServiceProvider, ServiceProvider } from './IServiceProvider';

export type Key<E> = keyof E & (string | symbol);

type WantedKeys<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E];
type FunctionSelector<T, E> = { [key in WantedKeys<T, E>]: key & string };
export type Selector<T, E> =
  | (keyof E & (string | symbol))
  | ((e: FunctionSelector<T, E>) => keyof E & string)
  | {
      name: keyof E & string;
      prototype: T;
    };

export type Factory<T, E> = (provider: E) => T;
export type DependencyConstructor<T, E> = { new (props: E): T } | { new (): T };
export type DependencyOptions<T, E> = { factory: Factory<T, E> } | DependencyConstructor<T, E>;

export type LifetimeConstructor<T, E> = new (name: Key<E>, factory: Factory<T, E>) => ILifetime<T, E>;

export interface IServiceCollection<E> {
  addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void;

  get<T>(item: Selector<T, E>): ILifetime<T, E> | undefined;

  remove<T>(item: Selector<T, E>): ILifetime<T, E> | undefined;

  build(): IServiceProvider<E>;
}

type RecordCollection<E> = Record<Key<E>, ILifetime<unknown, E>>;

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
    return new ServiceProvider<E>(this.lifetimes);
  }
}
