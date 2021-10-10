import { InternalProvider } from './InternalProvider';
import { Factory, ILifetime, Singleton, Transient } from './ILifetime';
import {
  DependencyError,
  DependencyErrorType,
  DependencyMultiError,
  DependencyMultiErrorType,
} from './DependencyError';
import { Keys, nameSelector } from './NameSelector';

type LifetimeProvider<T, E> = {
  new (container: Container<E>, className: string, providerName: string, factoryFunction: Factory<T, E>): ILifetime<
    T,
    E
  >;
};

type NameSelector<E> = (provider: Keys<E>) => string;

type ProviderProvider<E> = { prototype: E; name: string; new (): E };

type DependencyProvider<T, E> =
  | { prototype: T; name: string; new (provider: E): T }
  | { prototype: T; name: string; new (): T };

type DependencyOptions<T, E> = {
  factory?: Factory<T, E>;
  name?: NameSelector<E>;
};

export type DependencyGetter<T, E> = DependencyProvider<T, E> | string;

type ActualProvider<E> = E & InternalProvider<E>;

export class Container<E> {
  private readonly dependencyLookup: Record<string, ILifetime<any, E>> = {};
  private readonly providerLookup: Record<string, ILifetime<any, E>> = {};
  private readonly intendedDependencies: Record<string, string>;
  readonly template: E;
  private provider?: ActualProvider<E>;

  constructor(ProviderTemplate: ProviderProvider<E>) {
    this.template = new ProviderTemplate();
    this.intendedDependencies = Object.keys(this.template).reduce((a, b) => {
      a[b.toLowerCase()] = b;
      return a;
    }, {} as Record<string, string>);
  }

  addSingleton<T>(Dependency: DependencyProvider<T, E>, options: DependencyOptions<T, E> = {}) {
    this.add(Singleton, Dependency, options);
  }

  tryAddSingleton<T>(Dependency: DependencyProvider<T, E>, options: DependencyOptions<T, E> = {}) {
    this.tryAdd(Singleton, Dependency, options);
  }

  addTransient<T>(Dependency: DependencyProvider<T, E>, options: DependencyOptions<T, E> = {}) {
    this.add(Transient, Dependency, options);
  }

  tryAddTransient<T>(Dependency: DependencyProvider<T, E>, options: DependencyOptions<T, E> = {}) {
    this.tryAdd(Transient, Dependency, options);
  }

  add<T>(
    Lifetime: LifetimeProvider<T, E>,
    Dependency: DependencyProvider<T, E>,
    options: DependencyOptions<T, E> = {},
  ) {
    if (!this.tryAdd(Lifetime, Dependency, options)) {
      const providerName = options.name
        ? options.name(nameSelector(this.template))
        : this.intendedDependencies[Dependency.name.toLowerCase()];

      throw new DependencyError({
        type: DependencyErrorType.Duplicate,
        lifetime: providerName,
      });
    }
  }

  tryAdd<T>(
    Lifetime: LifetimeProvider<T, E>,
    Dependency: DependencyProvider<T, E>,
    { factory = (provider: E) => new Dependency(provider), name }: DependencyOptions<T, E> = {},
  ): boolean {
    const providerName = name
      ? name(nameSelector(this.template))
      : this.intendedDependencies[Dependency.name.toLowerCase()];

    if (!providerName) throw new DependencyError({ type: DependencyErrorType.Unknown, lifetime: Dependency });
    if (this.providerLookup[providerName]) return false;
    if (this.dependencyLookup[Dependency.name]) return false;

    this.dependencyLookup[Dependency.name] = new Lifetime(this, Dependency.name, providerName, factory);
    this.providerLookup[providerName] = new Lifetime(this, Dependency.name, providerName, factory);
    return true;
  }

  /**
   * Calling this there is no guarantee that it can provide an instance
   */
  get<T>(item: DependencyGetter<T, E>) {
    if (typeof item === 'string') return this.providerLookup[item] as ILifetime<T, E> | undefined;
    else return this.dependencyLookup[item.name] as ILifetime<T, E> | undefined;
  }

  preBuildValidate() {
    const missing = Object.keys(this.template)
      .filter((key) => !this.providerLookup[key])
      .map((key) => new DependencyError({ type: DependencyErrorType.Existence, lifetime: key }));

    if (missing.length === 1) throw missing[0];
    else if (missing.length > 1) throw new DependencyMultiError(DependencyMultiErrorType.Build, missing);
  }

  build() {
    if (this.provider) return this.provider;

    const provider = new InternalProvider(this) as ActualProvider<E>;

    this.preBuildValidate();

    Object.keys(this.template).forEach((providerName) => {
      const className = this.providerLookup[providerName]?.className;

      Object.defineProperty(provider, providerName, { get: () => provider.get(providerName) });

      if (className !== providerName)
        Object.defineProperty(provider, className, { get: () => provider.get(providerName) });
    });

    return (this.provider = provider);
  }
}
