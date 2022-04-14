# Sharp-Dependency-Injection

[![codecov](https://codecov.io/gh/Baizey/ts-dependency-injection/branch/master/graph/badge.svg?token=BD76USM0X4)](https://codecov.io/gh/Baizey/ts-dependency-injection)

Simple type strong dependency injection

## Goals of this package

- Minimal impact on how you write individual objects
- Be as close to C#'s IServiceCollection and IServiceProvider APIs as possible
- Avoid decorators and other pre-processing magic as much as possible
- Strong type checking

## Quick start

```
// This interface can also be a concatenation of all the prop fields for each class
// This 'global' type checker is optional and you can simply ignore it if desired
interface Provider {
    alice: Alice
    b: IBob
    c: string
}

class Alice {
    private readonly c: string;
    constructor(props: Provider){
      this.c = props.c;
    }
}
class Bob implements IBob {
    private readonly alice: Alice;
    constructor({ alice }: Provider){
      this.alice = alice;
    }
}

const services = new ServiceCollection<Provider>();
// Add dependencies using the <Dependency>, <Selector> inputs
// Dependencies is either the class, or a { factory: (provider) => ... } object
// Selector is either a type-strong string match with ServiceCollection or  a function (p) => p.alice which is also typestrong
services.addSingleton<Alice>(Alice, 'alice');
services.addScoped<IBob>(Bob, p => p.b)
services.addTransient<string>({factory: () => 'hello world'}, p => p.c)

const provider = services.build();

// Get instances in one of several ways
// They are equivilent and are all typestrong / refactor friendly
const alice1 = provider.provide(p => p.alice)
const alice2 = provider.provide('alice')
const { alice, b, c } = provider.proxy
```

# API

## Type references throughout

```
Generics used throughout:
T is always the type being provided by a lifetime
E is always your custom class dictating which dependencies the ServiceCollection will require to be added

LifeTimeConstructor<T, E> =
    | { new(name: keyof E & (string | symbol), factory: (p: E) => T) }
    | Singleton 
    | Scoped 
    | Transient
    
DependencyOptions<T, E>: 
    // A class constructor, fx Date, can only be used if class name is the same as the property in E it will be provided from
    | DependencyConstructor<T, E> 
    // A factory function and a selector, which is a type-strong helper to select a type-matching property in E
    | { factory: (p: E) => T }
      
// It is a requirement that any dependency either has a zero-parameter constructor or the first parameter taking in an instance of E
DependencyConstructor<T, E>: 
    | { new(): T } 
    | { new(provider: E): T }
    
Selector<T, E>: 
    | keyof E & (string | symbol)
    | ({...[key in keyof E as E[key] extends T]}) => keyof E
```

## ServiceCollection<E>

### Constructor

- `new<E>(template: E)`

### Add

`add<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>, Selector<T, E>)`

Returns `void`

Can throw

- `DuplicateDependencyError` if the resolved name from `DependencyOptions` has already been added

Alternatives:

- `addSingleton<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `addScoped<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `addTransient<T>(DependencyOptions<T, E>, Selector<T, E>)`

### TryAdd

`tryAdd<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>, Selector<T, E>)`

Returns `boolean`, true if added, false otherwise

Can throw

- Nothing

Alternatives:

- `tryAddSingleton<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `tryAddScoped<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `tryAddTransient<T>(DependencyOptions<T, E>, Selector<T, E>)`

### Replace

`replace<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>, Selector<T, E>)`

Returns `void`

Can throw

- Nothing

Alternatives:

- `replaceSingleton<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `replaceScoped<T>(DependencyOptions<T, E>, Selector<T, E>)`
- `replaceTransient<T>(DependencyOptions<T, E>, Selector<T, E>)`

### Get

- `get<T>(Selector<T, E>)`

returns `ILifetime<T, E> | undefined`

### Remove

- `remove<T>(Selector<T, E>)`

returns `ILifetime<T, E> | undefined`

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