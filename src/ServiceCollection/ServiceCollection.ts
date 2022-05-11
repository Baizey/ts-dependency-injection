import { ILifetime, Scoped, Singleton, Transient } from '../Lifetime'
import { DependencyErrorType, DuplicateDependencyError, ShouldBeMockedDependencyError } from '../Errors'
import { IServiceProvider, ScopedContext, ServiceProvider } from '../ServiceProvider'
import {
  DependencyOptions,
  Factory,
  IServiceCollection,
  Key,
  LifetimeConstructor,
  Selector,
  SelectorOptions,
  Stateful,
  StatefulDependencyConstructor,
} from './IServiceCollection'

export type MockSetup<E> = {
  [key in keyof E]?: Partial<Required<E>[key]> | Factory<E[key], E>;
};

export type RecordCollection<E> = Record<Key<E>, ILifetime<unknown, E>>;

export class ServiceCollection<E = any> implements IServiceCollection<E> {
  private static nextId = 1
  private readonly lifetimes: RecordCollection<E> = {} as RecordCollection<E>

  static extractSelector<T, E>(options: Selector<T, E>): Key<E> {
    switch (typeof options) {
      case 'function':
        const proxy = new Proxy({}, { get: (t, p) => p.toString() }) as SelectorOptions<T, E>
        return options(proxy)
      case 'symbol':
        return options.toString() as Key<E>
      case 'string':
        return options
      default:
        throw new Error(`Name selector could not match anything`)
    }
  }

  replaceSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Singleton, options, selector)
  }

  replaceTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Transient, options, selector)
  }

  replaceScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.replace(Scoped, options, selector)
  }

  replace<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.remove(selector)
    this.add(Lifetime, dependency, selector)
  }

  tryAddSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Singleton, options, selector)
  }

  tryAddTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Transient, options, selector)
  }

  tryAddScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>) {
    this.tryAdd(Scoped, options, selector)
  }

  tryAdd<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>) {
    try {
      this.add(Lifetime, dependency, selector)
    } catch (e) {
      const type = (e as DuplicateDependencyError).type
      if (type !== DependencyErrorType.Duplicate) throw e
    }
  }

  addStateful<T, P>(Constructor: StatefulDependencyConstructor<T, E, P>, selector: Selector<Stateful<P, T>, E>): void {
    const key = ServiceCollection.extractSelector(selector).toString()
    return this.addTransient<Stateful<P, T>>({
      factory: (_, context) => {
        const statefulContext = new ScopedContext(context)

        const singleton = context.lastSingleton
        statefulContext.enter({
          name: `${singleton ? `${String(singleton.name)}:` : ''}${key}#${ServiceCollection.nextId++}`,
          isSingleton: singleton?.isSingleton ?? false,
        })

        return {
          create: (props: P) => new Constructor(statefulContext.proxy, props),
        }
      },
    }, selector)
  }

  addSingleton<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Singleton, options, selector)
  }

  addTransient<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Transient, options, selector)
  }

  addScoped<T>(options: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    this.add(Scoped, options, selector)
  }

  add<T>(Lifetime: LifetimeConstructor<T, E>, dependency: DependencyOptions<T, E>, selector: Selector<T, E>): void {
    const name = ServiceCollection.extractSelector(selector)
    if (name in this.lifetimes) throw new DuplicateDependencyError(name)
    const factory = this.extractDependency(dependency)
    this.lifetimes[name] = new Lifetime(name, factory)
  }

  get<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
    const key = ServiceCollection.extractSelector(selector)
    return this.lifetimes[key] as ILifetime<T, E>
  }

  remove<T>(selector: Selector<T, E>): ILifetime<T, E> | undefined {
    const result = this.get(selector)
    if (result) delete this.lifetimes[result.name]
    return result
  }

  build(): IServiceProvider<E> {
    const lifetimes = this.cloneLifetimes()
    return new ServiceProvider<E>(lifetimes)
  }

  buildMock(mock?: MockSetup<E>): IServiceProvider<E> {
    const provider = this.build()
    Object.values<ILifetime<unknown, E>>(provider.lifetimes)
      .forEach((lifetime) => {
        const name = lifetime.name
        const mockSetup = mock && mock[name]
        const valueProxy = <T extends object>(obj: T): T => new Proxy(obj,
          {
            get(target, prop: (symbol | string) & keyof T) {
              if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.get)
                return target[prop]
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'get')
            },
            set(target, prop: (symbol | string) & keyof T, value) {
              if ((prop in target) || Object.getOwnPropertyDescriptor(target, prop)?.set) {
                target[prop] = value
                return true
              }
              throw new ShouldBeMockedDependencyError(name.toString(), prop.toString(), 'set')
            },
          },
        )
        provider.lifetimes[name] = new Proxy(lifetime, {
          get(target, prop: keyof ILifetime<unknown, E>) {
            if (prop !== 'provide') return target[prop]
            return (context: ScopedContext<E>) => {
              if (context.depth === 1) return target.provide(context)
              switch (typeof mockSetup) {
                case 'undefined':
                  return valueProxy({})
                case 'function':
                  return valueProxy(mockSetup(context.proxy, context) as any)
                default:
                  return valueProxy(mockSetup)
              }
            }
          },
        })
      })

    return provider
  }

  private extractDependency<T>(Option: DependencyOptions<T, E>): Factory<T, E> {
    if (typeof Option === 'function') return (p) => new Option(p)
    return Option.factory
  }

  private cloneLifetimes(): RecordCollection<E> {
    return Object.entries(this.lifetimes)
      .map(([key, value]) => ({
        name: key as Key<E>,
        lifetime: (value as ILifetime<unknown, E>).clone(),
      }))
      .reduce((a, { name, lifetime }) => {
        a[name] = lifetime
        return a
      }, {} as RecordCollection<E>)
  }
}