import { Container } from './Container';

export type Factory<T, E> = (provider: E) => T;

export interface ILifetime<T, E> {
  readonly className: string;
  readonly providerName: string;

  provide(): T;
}

export class Singleton<T, E> implements ILifetime<T, E> {
  private value?: T;
  private readonly factoryFunction: Factory<T, E>;
  private readonly container: Container<E>;
  readonly className: string;
  readonly providerName: string;

  constructor(container: Container<E>, className: string, providerName: string, factoryFunction: Factory<T, E>) {
    this.container = container;
    this.className = className;
    this.providerName = providerName;
    this.factoryFunction = factoryFunction;
  }

  provide() {
    return this.value || (this.value = this.factoryFunction(this.container.build()));
  }
}

export class Transient<T, E> implements ILifetime<T, E> {
  private readonly factory: Factory<T, E>;
  private container: Container<E>;
  readonly className: string;
  readonly providerName: string;

  constructor(container: Container<E>, className: string, providerName: string, factoryFunction: Factory<T, E>) {
    this.container = container;
    this.className = className;
    this.providerName = providerName;
    this.factory = factoryFunction;
  }

  provide() {
    return this.factory(this.container.build());
  }
}