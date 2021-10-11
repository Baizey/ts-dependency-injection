import { InternalProvider } from './InternalProvider';
import { Factory, ILifetime, Singleton, Transient } from './ILifetime';
import { DependencyError, DependencyMultiError } from './DependencyError';
import { properties } from './utils';
import {
  ActualProvider,
  DependencyErrorType,
  DependencyMultiErrorType,
  DependencyProvider,
  NameSelector,
} from './types';

type LifetimeProvider<T, E> = new (
  futureProvider: () => ActualProvider<E>,
  dependency: DependencyProvider<T, E>,
  providerName: string,
  factoryFunction: Factory<T, E>,
) => ILifetime<T, E>;

type ProviderProvider<E> = { prototype: E; name: string; new (): E };

type DependencyOptions<T, E> = {
  factory?: Factory<T, E>;
  selector?: NameSelector<T, E>;
};

type DependencyGetter<T, E> = string;

export class Container<E> {
  readonly template: E;
  private readonly providerLookup: Record<string, ILifetime<any, E>> = {};
  private readonly dependencyToProvider: Record<string, string>;
  private provider?: ActualProvider<E>;

  constructor(ProviderTemplate: ProviderProvider<E>) {
    this.template = new ProviderTemplate();
    this.dependencyToProvider = Object.keys(this.template).reduce((a, b) => {
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
      const providerName = options.selector
        ? options.selector(properties(this.template))
        : this.dependencyToProvider[Dependency.name.toLowerCase()];

      throw new DependencyError({
        type: DependencyErrorType.Duplicate,
        lifetime: providerName,
      });
    }
  }

  tryAdd<T>(
    Lifetime: LifetimeProvider<T, E>,
    Dependency: DependencyProvider<T, E>,
    { factory = (provider: E) => new Dependency(provider), selector }: DependencyOptions<T, E> = {},
  ): boolean {
    const providerName = selector
      ? selector(properties(this.template))
      : this.dependencyToProvider[Dependency.name.toLowerCase()];

    if (!providerName) throw new DependencyError({ type: DependencyErrorType.Unknown, lifetime: Dependency.name });
    if (this.providerLookup[providerName]) return false;

    this.providerLookup[providerName] = new Lifetime(() => this.build(), Dependency, providerName, factory);
    return true;
  }

  /**
   * Calling this there is no guarantee that it can provide an instance
   */
  get<T>(item: DependencyGetter<T, E>) {
    return this.providerLookup[item] as ILifetime<T, E> | undefined;
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
      Object.defineProperty(provider, providerName, { get: () => provider.get(providerName) });
    });

    return (this.provider = provider);
  }
}
