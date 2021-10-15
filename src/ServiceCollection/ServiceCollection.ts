import { ILifetime, Scoped, Singleton, Transient } from '../Lifetime';
import { DependencyOptions, LifetimeConstructor, ProviderConstructor } from './types';
import {
  DuplicateDependencyError,
  ExistenceDependencyError,
  MultiDependencyError,
  UnknownDependencyError,
} from '../Errors';
import { DependencyConstructor, Factory, NameSelector, ProviderScope, ProviderValidation } from '../types';
import { InternalServiceProvider, ServiceProvider } from '../ServiceProvider';
import { properties } from '../utils';
import { IServiceCollection } from './IServiceCollection';

export class ServiceCollection<E> implements IServiceCollection<E> {
  readonly template: Required<E>;
  private readonly lifetimes: Record<string, ILifetime<any, E>> = {};
  private readonly dependencyToProvider: Record<string, string>;

  constructor(ProviderTemplate: ProviderConstructor<E>) {
    this.template = new ProviderTemplate() as Required<E>;
    this.dependencyToProvider = Object.keys(this.template).reduce((a, b) => {
      a[b.toLowerCase()] = b;
      return a;
    }, {} as Record<string, string>);
  }

  add<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): void {
    if (!this.tryAdd(Lifetime, options)) {
      const [name] = this.resolvePropertyConstructor(options);
      throw new DuplicateDependencyError(name);
    }
  }

  tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): boolean {
    const [name, factory, dependency] = this.resolvePropertyConstructor(options);

    if (!name) throw new UnknownDependencyError(dependency?.name || '');
    if (this.lifetimes[name]) return false;

    this.lifetimes[name] = new Lifetime(name, factory);
    return true;
  }

  get<T>(item: NameSelector<T, E>): ILifetime<T, E> | undefined {
    return this.lifetimes[this.resolveProperty(item)] as ILifetime<T, E> | undefined;
  }

  replace<T>(Lifetime: LifetimeConstructor<T, E>, options: DependencyOptions<T, E>): void {
    const [name] = this.resolvePropertyConstructor(options);
    this.remove(name);
    this.add(Lifetime, options);
  }

  remove<T>(item: NameSelector<T, Required<E>>): boolean {
    const name = this.resolveProperty(item);

    if (!this.lifetimes[name]) return false;

    delete this.lifetimes[name];
    return true;
  }

  build(validate: boolean = false): ServiceProvider<E> {
    const createContext = (validation: ProviderValidation, context: ProviderScope): ServiceProvider<E> => {
      const provider = new InternalServiceProvider<E>(this, createContext, validation, context);
      Object.keys(this.template).forEach((name) => {
        Object.defineProperty(provider, name, { get: () => provider.getService(name) });
      });
      return provider as ServiceProvider<E>;
    };

    return createContext({ validate: validate, trail: {} }, null as unknown as {});
  }

  validate(): void {
    const serviceProvider = this.build(true);
    const keys = Object.keys(this.template);
    const unresolved: Error[] = [];

    for (let key of keys) {
      try {
        if (!this.lifetimes[key]) unresolved.push(new ExistenceDependencyError(key));
        else serviceProvider.getService(key);
      } catch (e: unknown) {
        unresolved.push(e as Error);
      }
    }

    if (unresolved.length === 0) return;

    throw new MultiDependencyError(unresolved);
  }

  resolveProperty<T>(item?: NameSelector<T, Required<E>>, dependency?: DependencyConstructor<T, Required<E>>): string {
    if (item) return typeof item === 'string' ? item : item(properties(this.template));
    if (dependency) return this.dependencyToProvider[dependency.name.toLowerCase()];
    return '';
  }

  private resolvePropertyConstructor<T>(
    options: DependencyOptions<T, Required<E>>,
  ): [string, Factory<T, Required<E>>, DependencyConstructor<T, Required<E>> | undefined] {
    if (typeof options === 'function') {
      return [this.resolveProperty(undefined, options), (p) => new options(p), options];
    } else if (options.dependency) {
      const { dependency, selector, factory = (p) => new dependency(p) } = options;
      return [this.resolveProperty(selector, dependency), factory, dependency];
    } else {
      const { selector, factory } = options;
      return [this.resolveProperty(selector), factory, undefined];
    }
  }

  addSingleton<T>(options: DependencyOptions<T, E>): void {
    return this.add(Singleton, options);
  }

  addScoped<T>(options: DependencyOptions<T, E>): void {
    return this.add(Scoped, options);
  }

  addTransient<T>(options: DependencyOptions<T, E>): void {
    return this.add(Transient, options);
  }

  tryAddSingleton<T>(options: DependencyOptions<T, E>): boolean {
    return this.tryAdd(Singleton, options);
  }

  tryAddScoped<T>(options: DependencyOptions<T, E>): boolean {
    return this.tryAdd(Scoped, options);
  }

  tryAddTransient<T>(options: DependencyOptions<T, E>): boolean {
    return this.tryAdd(Transient, options);
  }

  replaceSingleton<T>(options: DependencyOptions<T, E>): void {
    return this.replace(Singleton, options);
  }

  replaceScoped<T>(options: DependencyOptions<T, E>): void {
    return this.replace(Scoped, options);
  }

  replaceTransient<T>(options: DependencyOptions<T, E>): void {
    return this.replace(Transient, options);
  }
}
