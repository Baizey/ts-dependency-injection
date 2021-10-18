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
// If you have useDefineForClassFields as true in tsconfig you can avoid the 'null as unknown as T'
class Provider {
    alice: Alice = null as unknown as Alice;
    b: IBob = null as unknown as IBob;
    c: string = null as unknown as string;
}
class Alice {
    constructor({ c }: Provider){
    }
}
class Bob implements IBob {
    constructor({ alice }: Provider){
    }
}

const services = new ServiceCollection(Provider);
services.addSingleton(Alice);
services.addScoped({dependency: Bob, selector: p => p.b})
services.addTransient({factory: 'hello world', selector: p => p.c})

services.validate();

const {alice, b, c} = services.build();
```

### useDefineForClassFields
If you include this in your ``tsconfig.json``
```
{
    ...
    "compilerOptions": {
        ...
        "useDefineForClassFields": true
        ...
    },
    ...
 }
```
You can create a provider as such:
```
// Use this only when creating the ServiceCollection
class WeakProvider {
    alice?: Alice;
    b?: IBob;
    c?: string;
}
// Use this everywhere else
type Provider = Required<WeakProvider>;
// Fx
const services = new ServiceCollection(WeakProvider);
class Alice{
    constructor(p: Provider){}
}
```

## API

### Type references throughout
```
Generics used throughout:
T is always the type being provided by a lifetime
E is always your custom class dictating which dependencies the ServiceCollection will require to be added

LifeTimeConstructor<T, E> =
    | { new(name: string, factory: (p: ServiceProvider<E>) => ILifetime<T, E>) }
    | Singleton 
    | Scoped 
    | Transient
    
DependencyOptions<T, E>: 
    // A class constructor, fx Date, can only be used if class name is the same as the property in E it will be provided from
    | DependencyConstructor<T, E> 
    
    // A factory function and a selector, which is a type-strong helper to select a type-matching property in E
    | { 
        factory: (p: ServiceProvider<E>) => T,
        selector: NameSelector<T, E>
      }
      
    // A class constructor and selector, useful if the class name does not match the property in E it should be provided by
    | { 
        dependency: DependencyConstructor<T, E>,
        selector: NameSelector<T, E>
      } 
      
// It is a requirement that any dependency either has a zero-parameter constructor or the first parameter taking in an instance of E
DependencyConstructor<T, E>: 
    | { new(): T } 
    | { new(provider: E): T }
    
NameSelector<T, E>: 
    | string
    | ({k in keyof E which value extends T}) => keyof E
```

### ServiceCollection<E>

#### Constructor
- `new<E>(template: E)`

#### Add
- `add<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`
- `addSingleton<T>(DependencyOptions<T, E>)`
- `addScoped<T>(DependencyOptions<T, E>)`
- `addTransient<T>(DependencyOptions<T, E>)`
- `addProvider(NameSelector<T, E>?)`

Returns `void`

Note: addProvider is a short for 

```
services.addScoped<ServiceProvider<E>>({
    factory: p => p.createScoped(), 
    selector: NameSelector<T, E> || 'provider'
})
```

Can throw
- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`
- `DuplicateDependencyError` if the resolved name from `DependencyOptions` has already been added

#### TryAdd
- `tryAdd<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`
- `tryAddSingleton<T>(DependencyOptions<T, E>)`
- `tryAddScoped<T>(DependencyOptions<T, E>)`
- `tryAddTransient<T>(DependencyOptions<T, E>)`

Returns `boolean`, true if added, false otherwise

Can throw
- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`

#### Replace
- `replace<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`
- `replaceSingleton<T>(DependencyOptions<T, E>)`
- `replaceScoped<T>(DependencyOptions<T, E>)`
- `replaceTransient<T>(DependencyOptions<T, E>)`

Returns `void`

Can throw
- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`

#### Get
- `get<T>(NameSelector<T, E>)`

returns `ILifetime<T, E> | undefined`

#### Remove
- `remove<T>(NameSelector<T, E>)`

returns `boolean`, true if anything, false otherwise

#### Build
- `build(validate: boolean = true)`

returns `ServiceProvider<T, E>`

#### Validate
- `validate()`

returns `void`

Can throw
- `MultiDependencyError`, A summarized error for all other errors that might have been thrown
- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps the `Scoped` lifetime as a `Singleton`
- `ExistanceDependencyError`, you forgot to provide for one of the properties of `E`

### ServiceProvider<E>

#### GetService
- `getService<T>(NameSelector<T, E>)`

returns `T`

#### createRootScoped
- `createRootScoped()`

Returns ``ServiceProvider<E>`` with a reset scope as-if you did ``services.build(...)`` again (will keep validation on/off from what you picked)

Note: ``Singleton`` instances that has been / will be instantiated is still shared across all scopes

#### createScoped
- `createScoped()`

returns ``ServiceProvider<E>`` with a reset validation context.

Warning: Never allow ``Singleton`` lifetimes to keep permanent hold of a provider.

Dummy example of the best way to add the provider to itself:

```
class WeakProvider {
    ...
    provider?: ServiceProvider<WeakProvider>
    ...
}
...
// Scoped is prefered as it puts an automatic blocker for direct bad usage with singletons
services.addProvider(p => p.provider);
```

### ILifetime<T, E>
- ``Singleton``, 1 to rule all
- ``Scoped``, 1 per request
- ``Transient``, always a new one

#### Provide
- `provide(provider: ServiceProvider<T, E>)`

returns ``T`` based on assigned lifetime

Can throw
- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps the `Scoped` lifetime as a `Singleton`