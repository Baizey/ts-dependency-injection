import { Container } from './Container';
import { DependencyProvider } from './types';

export type Factory<T, E> = (provider: E) => T;

export interface ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;

  provide(): T;
}

export class Singleton<T, E> implements ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;
  private value?: T;
  private readonly factoryFunction: Factory<T, E>;
  private readonly container: Container<E>;

  constructor(
    container: Container<E>,
    dependency: DependencyProvider<T, E>,
    providerName: string,
    factoryFunction: Factory<T, E>,
  ) {
    this.container = container;
    this.dependency = dependency;
    this.providerName = providerName;
    this.factoryFunction = factoryFunction;
  }

  provide() {
    return this.value || (this.value = this.factoryFunction(this.container.build()));
  }
}

export class Transient<T, E> implements ILifetime<T, E> {
  readonly dependency: DependencyProvider<T, E>;
  readonly providerName: string;
  private readonly factory: Factory<T, E>;
  private container: Container<E>;

  constructor(
    container: Container<E>,
    dependency: DependencyProvider<T, E>,
    providerName: string,
    factoryFunction: Factory<T, E>,
  ) {
    this.container = container;
    this.dependency = dependency;
    this.providerName = providerName;
    this.factory = factoryFunction;
  }

  provide() {
    return this.factory(this.container.build());
  }
}
