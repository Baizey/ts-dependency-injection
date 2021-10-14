import { InternalProvider } from './InternalProvider';
import { properties } from './utils';
import {
  ActualProvider,
  DependencyProvider,
  Factory,
  NameSelector,
  ProviderContext,
  ProviderValidation,
} from './types';
import { ILifetime } from './Lifetime';
import {
  DuplicateDependencyError,
  ExistenceDependencyError,
  MultiDependencyError,
  UnknownDependencyError,
} from './Errors';

type LifetimeProvider<T, E> = new (name: string, factoryFunction: Factory<T, E>) => ILifetime<T, E>;

type ProviderProvider<E> = { prototype: E; name: string; new (): E };

type DependencyOptions<T, E> =
  | {
      dependency?: undefined;
      factory: Factory<T, E>;
      selector: NameSelector<T, E>;
    }
  | {
      dependency: DependencyProvider<T, E>;
      factory?: Factory<T, E>;
      selector?: NameSelector<T, E>;
    }
  | DependencyProvider<T, E>;

export class Container<E> {
  private static provider?: ActualProvider<any>;

  public static getOrCreate<T>(factory?: () => Container<T>): ActualProvider<T> {
    if (this.provider) return this.provider;
    if (!factory) throw new Error('Factory not provided and no global provider exists');
    return (this.provider = factory().build());
  }

  public static async getOrCreateAsync<T>(factory?: () => Promise<Container<T>>): Promise<ActualProvider<T>> {
    if (this.provider) return this.provider;
    if (!factory) throw new Error('Factory not provided and no global provider exists');
    return (this.provider = (await factory()).build());
  }

  readonly template: E;
  private readonly lifetimes: Record<string, ILifetime<any, E>> = {};
  private readonly dependencyToProvider: Record<string, string>;

  constructor(ProviderTemplate: ProviderProvider<E>) {
    this.template = new ProviderTemplate();
    this.dependencyToProvider = Object.keys(this.template).reduce((a, b) => {
      a[b.toLowerCase()] = b;
      return a;
    }, {} as Record<string, string>);
  }

  add<T>(Lifetime: LifetimeProvider<T, E>, options: DependencyOptions<T, E>): void {
    if (!this.tryAdd(Lifetime, options)) {
      const [name] = this.resolvePropertyConstructor(options);
      throw new DuplicateDependencyError(name);
    }
  }

  tryAdd<T>(Lifetime: LifetimeProvider<T, E>, options: DependencyOptions<T, E>): boolean {
    const [name, factory, dependency] = this.resolvePropertyConstructor(options);

    if (!name) throw new UnknownDependencyError(dependency?.name || '');
    if (this.lifetimes[name]) return false;

    this.lifetimes[name] = new Lifetime(name, factory);
    return true;
  }

  get<T>(item: NameSelector<T, E>): ILifetime<T, E> | undefined {
    return this.lifetimes[this.resolveProperty(item)] as ILifetime<T, E> | undefined;
  }

  remove<T>(item: NameSelector<T, E>): boolean {
    const name = this.resolveProperty(item);

    if (!this.lifetimes[name]) return false;

    delete this.lifetimes[name];
    return true;
  }

  build(validate: boolean = false): ActualProvider<E> {
    this.preBuildValidate();

    const createContext = (validation: ProviderValidation<E>, context: ProviderContext<E>): ActualProvider<E> => {
      const provider = new InternalProvider<E>(this, createContext, validation, context);
      Object.keys(this.template).forEach((name) => {
        Object.defineProperty(provider, name, { get: () => provider.get(name) });
      });
      return provider as ActualProvider<E>;
    };

    return createContext({ validate: validate, trail: {} }, null as unknown as {});
  }

  resolveProperty<T>(item?: NameSelector<T, E>, dependency?: DependencyProvider<T, E>): string {
    if (item) return typeof item === 'string' ? item : item(properties(this.template));
    if (dependency) return this.dependencyToProvider[dependency.name.toLowerCase()];
    return '';
  }

  private resolvePropertyConstructor<T>(
    options: DependencyOptions<T, E>,
  ): [string, Factory<T, E>, DependencyProvider<T, E> | undefined] {
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

  private preBuildValidate() {
    const missing = Object.keys(this.template)
      .filter((key) => !this.lifetimes[key])
      .map((key) => new ExistenceDependencyError(key));

    if (missing.length === 1) throw missing[0];
    else if (missing.length > 1) throw new MultiDependencyError(missing);
  }
}
