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

type LifetimeProvider<T, E> = new (
  dependency: DependencyProvider<T, E>,
  providerName: string,
  factoryFunction: Factory<T, E>,
) => ILifetime<T, E>;

type ProviderProvider<E> = { prototype: E; name: string; new (): E };

type DependencyOptions<T, E> = {
  factory?: Factory<T, E>;
  selector?: NameSelector<T, E>;
};

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

  add<T>(
    Lifetime: LifetimeProvider<T, E>,
    Dependency: DependencyProvider<T, E>,
    options: DependencyOptions<T, E> = {},
  ): void {
    if (!this.tryAdd(Lifetime, Dependency, options))
      throw new DuplicateDependencyError(this.resolveProperty(options.selector, Dependency));
  }

  tryAdd<T>(
    Lifetime: LifetimeProvider<T, E>,
    Dependency: DependencyProvider<T, E>,
    { factory = (provider: E) => new Dependency(provider), selector }: DependencyOptions<T, E> = {},
  ): boolean {
    const providerName = this.resolveProperty(selector, Dependency);

    if (!providerName) throw new UnknownDependencyError(Dependency.name);
    if (this.lifetimes[providerName]) return false;

    this.lifetimes[providerName] = new Lifetime(Dependency, providerName, factory);
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

    const createValidationContext = (
      validation: ProviderValidation<E>,
      context: ProviderContext<E>,
    ): ActualProvider<E> => {
      const provider = new InternalProvider<E>(this, createValidationContext, validation, context);
      Object.keys(this.template).forEach((providerName) => {
        Object.defineProperty(provider, providerName, { get: () => provider.get(providerName) });
      });
      return provider as ActualProvider<E>;
    };

    return createValidationContext({ validate: validate, trail: {} }, null as unknown as {});
  }

  resolveProperty<T>(item?: NameSelector<T, E>, Dependency?: DependencyProvider<T, E>): string {
    if (item) return typeof item === 'string' ? item : item(properties(this.template));
    if (Dependency) return this.dependencyToProvider[Dependency.name.toLowerCase()];
    return undefined as unknown as string;
  }

  private preBuildValidate() {
    const missing = Object.keys(this.template)
      .filter((key) => !this.lifetimes[key])
      .map((key) => new ExistenceDependencyError(key));

    if (missing.length === 1) throw missing[0];
    else if (missing.length > 1) throw new MultiDependencyError(missing);
  }
}
