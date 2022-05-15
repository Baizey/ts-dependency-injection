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
type AliceDep = { c: string }
class Alice {
    c: string
    constructor({ c }: AliceDep){
      this.c = c
    }
}
type BobDep = { alice: Alice }
class Bob implements IBob {
    alice: Alice
    constructor({ alice }: BobDep){
      this.alice = alice
    }
}
type SomethingDep = { bob: IBob }
type SomethingProps = { ... }
class Something {
    props: SomethingProps
    bob: IBob
    constructor({bob}: SomethingDep, props: SomethingProps){
      this.bob = bob
      this.props = props
    }
}

// Note, the service collection is smart so it will know if you add Bob without having added Alice and do a type-complaining
// You should never touch the generics on any ServiceCollection method unless you know what you do, they're doing black magic to let typescript know whats happening
const services = Services() // or new ServiceCollection()
  .addSingleton('c', { factory: () => 'Hello world' })
  .addScoped('alice', Alice)
  .addTransient('bob', Bob)
  .addStateful('somethingFactory', Something)
const provider = services.build();

// All of these are equivilent and typestrong methods for getting services provided
const bob = provider.provide(p => p.bob)
const alice = provider.provide('alice')
const { alice, bob, c } = provider.proxy
```

# API

## Type references throughout

```
Generics used throughout:
T is always the type being provided by a lifetime
E is always your custom class dictating which dependencies the ServiceCollection will require to be added
P is props for any stateful dependencies
KE is an extra generic to allow typescript to figure stuff out, with an unknown object having a key to either add or remove from E  
    
LifeTimeConstructor<T, E> =
    | { new(name: keyof E & (string | symbol), factory: (p: E) => T): ILifetime<T, E> }
    | Singleton 
    | Scoped 
    | Transient
    
StatefulDependencyOptions<T, P, E>: 
    | StatefulDependencyConstructor<T, P, E> 
    | { factory: (provider: E, props: P) => T }
  
StatefulDependencyConstructor<T, E>: 
    | DependencyConstructor<T, E>
    | { new(provider: E, props: P): T }
      
DependencyOptions<T, E>: 
    | DependencyConstructor<T, E> 
    | { factory: (p: E) => T }

DependencyConstructor<T, E>: 
    | { new(): T } 
    | { new(provider: E): T }
    
Selector<T, E, KE>: 
    | keyof E & (string | symbol)
    | ({...[key in keyof E as E[key] extends T]}) => keyof E
```

## ServiceCollection<E>

### Constructor

- `new<E = {}>()`

alternative: use `Services()` as a provided quick-create method

### Add

`add<T, KE>(LifeTimeConstructor<T, E>, keyof KE & string, DependencyOptions<T, E>)`

Generic `KE` is here to allow typescript to know what's going on, it should not be manually set

Returns `ServiceCollection<{ [key in KE]: T } & E>`

Can throw

- `DuplicateDependencyError` if the resolved name from `DependencyOptions` has already been added

Alternatives:

- `addSingleton<T, KE>(keyof KE & string, DependencyOptions<T, E>)`
- `addScoped<T, KE>(keyof KE & string, DependencyOptions<T, E>)`
- `addTransient<T, KE>(keyof KE & string, DependencyOptions<T, E>)`

### Get

- `get<T>(Selector<T, E>)`

returns `ILifetime<T, E> | undefined`

### Remove

- `remove<T, KE>(Selector<T, E, KE>)`

returns `ServiceCollection<Omit<E, keyof KE>>`

### Build

- `build()`

returns `IServiceProvider<T, E>`

### BuildMock

This is only meant for testing, it will provide a IServiceProvider similar to `build()` except that any dependencies
will be forcefully mocked

- `buildMock(setup?: { [key in keyof E]: Partial<E[key]> | Factory<T, E>})`

returns `IServiceProvider<T, E>`

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

### Provide

- `provide(provider: ScopedContext<T, E>)`

returns ``T`` based on assigned lifetime

Note: This is not meant to be used manually, but can be done via: `new ScopedContext(services.build().lifetimes)`

Can throw

- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps
  the `Scoped` lifetime as a `Singleton`