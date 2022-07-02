# Sharp-Dependency-Injection

[![codecov](https://codecov.io/gh/Baizey/ts-dependency-injection/branch/master/graph/badge.svg?token=BD76USM0X4)](https://codecov.io/gh/Baizey/ts-dependency-injection)

Simple type strong dependency injection

## Goals of this package

- Minimal impact on how you write individual objects
- Draw inspiration from .net core's dependency injection, but with a distinct ts/js flavour
- Avoid decorators and other pre-processing magic as much as possible
- Strong type checking

## Quick start

```
// Class with no dependencies
class Alice { ... }

// Class with dependencies
type BobDep = { alice: Alice, fixedName: string }
class Bob {
    ...
    constructor({ alice }: BobDep){ ... }
}

// Stateful class
type SomethingDep = { ... }
type SomethingProps = { ... }
class Something {
    props: SomethingProps
    bob: IBob
    constructor(dependencies: SomethingDep, props: SomethingProps){ ... }
}


const services = Services() // or new ServiceCollection()
  // Add multiple dependencies at ones
  // This is required if you're adding 10+ dependencies, otherwise TS itself will struggle known whats provided
  .add({
    alice: singleton(Alice),
    fixedName: singleton({ factory: () => 'text' }),
  })
  // Chain adding as required
  .add({
    bob: scoped(Bob),
    somethingFactory: stateful(Something),
  })

// Building a provider is simple and each build will be completly independent of each other
const provider = services.build();

// All of these ways of providing instances are equivilent, note they are all type-strong so the ide can guide you
const bob = provider.provide(p => p.bob)
const alice = provider.provide('alice')
const { alice, bob, somethingFactory } = provider.proxy
```

# API

## Type references throughout

```
Generics used throughout:
T is the type being provided by a lifetime, note that statefuls are actually Stateful<Prop, T>
E is always your custom class dictating which dependencies the ServiceCollection will require to be added
P is props for any stateful dependencies, for any non-stateful this will be defaulted as void/undefined
KE is an extra generic to allow typescript to figure stuff out, with an unknown object having a key to either add or remove from E  
    
type Key<E> = keyof E & (string)

type LifetimeCollection<E = any> = { [key in keyof E]: ILifetime<unknown, E> }
type MatchingProperties<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E]
type SelectorOptions<T = any, E = any> = { [key in MatchingProperties<T, E>]: key & Key<E> }
type Selector<T, E> = Key<E> | (( e: SelectorOptions<T, E> ) => Key<E>)

type Stateful<P, T> = { create( props: P ): T }

type Factory<T, P, E> = ( provider: E, props: P, scope: ScopedServiceProvider<E> ) => T

type LifetimeConstructor<T = any, P = void, E = any> =
	{ new( name: Key<E>, factory: Factory<T, P, E> ): ILifetime<T, E> }
	
type StatefulConstructor<T, P, E> = { new( provider: E, props: P ): T }

type NormalConstructor<T, E> = { new( provider: E ): T } | { new(): T }

type FactoryOption<T, P, E> = { factory: Factory<T, P, E> }
type ConstructorOption<T, E> = { constructor: NormalConstructor<T, E> }
type DependencyOption<T, E> = FactoryOption<T, void, E> | ConstructorOption<T, E>
type DependencyInformation<T, E> = { lifetime: LifetimeConstructor } & DependencyOption<T, E>

type DependencyMap<E, F> = { [key in keyof F]: DependencyInformation<F[key], any> }
```

## ServiceCollection<E>

### Constructor

- `new<E = {}>()`

alternative: use `Services()` as a provided quick-create method

### Add

`add<KT, F extends DependencyMap<E, KT>>( dependencies: F & DependencyMap<E, KT> )`

Generic `KT` and `F` is here to allow typescript to do magic, they should never be used manually

Returns `ServiceCollection<E & KT>`

Can throw

- `DuplicateDependencyError` if the resolved name from `DependencyOptions` has already been added

### Get

- `get<T>(Selector<T, E>)`

returns `ILifetime<T, E> | undefined`

### Remove

- `remove<T, K>(Selector<T, E>)`

returns `ServiceCollection<Omit<E, K>>`

### Build

- `build()`

returns `IServiceProvider<T, E>`

### BuildMock

This is only meant for testing, it will provide a IServiceProvider similar to `build()`

except that only the directly provided dependencies will be given normally, anything they depend on will be mocked

How this mocking occurs can be modified via the setup

Note if you give a `MockStrategy` as first argument is as if you only gave `defaultMockType` with that value

- `buildMock(mock: MockStrategy | ProviderMock<E> = {}, defaultMockType?: MockStrategy)`

returns `IServiceProvider<T, E>`

#### Types involved

This wont be easily understandable, but it describes all the possibilities for mocking

````
type PartialNested<T> = { [key in keyof T]?: T[key] extends object ? PartialNested<T[key]> : T[key] }
type PropertyMock<T> = { [key in keyof T]?: PartialNested<T[key]> | MockStrategy | null | (() => null) }
type DependencyMock<E, K extends keyof E> =
  | Partial<PropertyMock<E[K]>>
  | Factory<Partial<PropertyMock<E[K]>>, any, E>
  | MockStrategy
type ProviderMock<E> = { [key in keyof E]?: DependencyMock<E, key> };
enum MockStrategy {
  dummyStub = 'dummyStub', // All getter/setter works, but default value is null
  nullStub = 'nullStub', // All setters are ignored, and getters return null
  exceptionStub = 'exceptionStub', // All getters and setters throw exception
}
````

## IServiceProvider<E>

### Proxy

- `proxy`

returns `E`

Note all properties on result acts as-if you used `provide<T>(...)` on the service provider itself

### Provide

- `provide<T>(Selector<T, E>)`

returns `T`

Can throw

- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps
  the `Scoped` lifetime as a `Singleton`
- `ExistanceDependencyError`, you forgot to provide for one of the properties of `E`

## ILifetime<T, E>

- ``Singleton``, 1 to rule all
- ``Scoped``, 1 per request
- ``Transient``, always a new one
- ``Stateful``, always a new one, returns `Stateful<P, T>` which is equivalent to `{ create(p: P) => T }`

### Provide

- `provide(provider: ScopedContext<T, E>)`

returns ``T`` based on assigned lifetime

Note: This is not meant to be used manually, but can be done via: `new ScopedContext(services.build().lifetimes)`

Can throw

- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps
  the `Scoped` lifetime as a `Singleton`