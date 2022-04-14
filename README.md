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
    provider?: ServiceProvider<Provider>;
}
class Alice {
    constructor({ c }: Provider){
    }
}
class Bob implements IBob {
    constructor({ alice, provider }: Provider){
    }
}

const services = new ServiceCollection<Provider>();
services.addSingleton(Alice);
services.addScoped({dependency: Bob, selector: p => p.b})
services.addTransient({factory: () => 'hello world', selector: p => p.c})
services.addProvider();

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
const services = new ServiceCollection<WeakProvider>();
class Alice{
    constructor(p: Provider){}
}
```

# API

## Type references throughout

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

## ServiceCollection<E>

### Constructor

- `new<E>(template: E)`

### Add

`add<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`

Returns `void`

Can throw

- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`
- `DuplicateDependencyError` if the resolved name from `DependencyOptions` has already been added

Alternatives:

- `addSingleton<T>(DependencyOptions<T, E>)` alt for `add<T>(Singleton, DependencyOptions<T, E>)`
- `addScoped<T>(DependencyOptions<T, E>)` alt for `add<T>(Scoped, DependencyOptions<T, E>)`
- `addTransient<T>(DependencyOptions<T, E>)` alt for `add<T>(Transient, DependencyOptions<T, E>)`
- `addProvider(s: NameSelector<T, E>?)` alt
  for `addScoped<T>({factory: p => p.createScoped(), selector: s ?? 'provider'})`

### TryAdd

`tryAdd<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`

Returns `boolean`, true if added, false otherwise

Can throw

- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`

Alternatives:

- `tryAddSingleton<T>(DependencyOptions<T, E>)` alt for `tryAdd<T>(Singleton, DependencyOptions<T, E>)`
- `tryAddScoped<T>(DependencyOptions<T, E>)` alt for `tryAdd<T>(Scoped, DependencyOptions<T, E>)`
- `tryAddTransient<T>(DependencyOptions<T, E>)` alt for `tryAdd<T>(Transient, DependencyOptions<T, E>)`

### Replace

`replace<T>(LifeTimeConstructor<T, E>, DependencyOptions<T, E>)`

Returns `void`

Can throw

- `UnknownDependencyError` if the resolved name from `DependencyOptions` does not match any property on `E`

Alternatives:

- `replaceSingleton<T>(DependencyOptions<T, E>)` alt for `replace<T>(Singleton, DependencyOptions<T, E>)`
- `replaceScoped<T>(DependencyOptions<T, E>)` alt for `replace<T>(Scoped, DependencyOptions<T, E>)`
- `replaceTransient<T>(DependencyOptions<T, E>)` alt for `replace<T>(Transient, DependencyOptions<T, E>)`

### Get

- `get<T>(NameSelector<T, E>)`

returns `ILifetime<T, E> | undefined`

### Remove

- `remove<T>(NameSelector<T, E>)`

returns `boolean`, true if anything was removed, false otherwise

### Build

- `build()`

returns `ServiceProvider<T, E>`

### Validate

- `validate()`

returns `void`

Can throw

- `MultiDependencyError`, A summarized error for all other errors that might have been thrown
- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps
  the `Scoped` lifetime as a `Singleton`
- `ExistanceDependencyError`, you forgot to provide for one of the properties of `E`

## ServiceProvider<E>

### GetService

- `getService<T>(NameSelector<T, E>)`

returns `T`

### createScoped

- `createScoped()`

returns ``ServiceProvider<E>`` with a reset validation context.

Note: look into ``services.addProvider()`` before manually using this

## ILifetime<T, E>

- ``Singleton``, 1 to rule all
- ``Scoped``, 1 per request
- ``Transient``, always a new one

### Provide

- `provide(provider: ServiceProvider<T, E>)`

returns ``T`` based on assigned lifetime

Can throw

- `CircularDependencyError`, two dependencies require each other to be resolved, resulting in a never ending resolving
- `SingletonScopedDependencyError`, A ``singleton`` depending on a ``Scoped`` lifetime, this is not allowed as it traps
  the `Scoped` lifetime as a `Singleton`

# Testing

This npm package includes a simple way mocking all dependencies given it can provide.

It takes inspiration from C# nugets such as AutoFixture and AutoMoq.

``ProviderMock.mock(ServiceProvider<E>, options?: { [k keyof E]: (value: T, provider: ServiceProvider<E>) => void })``

You may want to use this if:
- You want to avoid writing code twice
- You want to enforce single-component testing
- You need to run tests which utilizes the lifetimes provided by the dependency injection

Example usage:

```
const services = new ServiceCollection<Provider>();
...
const provider = services.build();

let spy;
ProviderMock.mock(provider, {
  dependency: (dependencyMock, provider) => {
    spy = jest.spyOn(mock, 'getName').mockReturnValue('MockValue');
  },
});

const { sut } = provider;

expect(sut.callDependencyGetName()).toBe('MockValue');
expect(spy).toBeCalledTimes(1);
```

If you forget to mock a dependency's function:

```
const services = new ServiceCollection<Provider>();
...
const provider = services.build();

let spy;
ProviderMock.mock(provider);

const { sut } = provider;

expect(sut.callDependencyGetName()).toBe('MockValue'); // Throws ShouldBeMockedDependencyError: 'function dependency.getName'
expect(spy).toBeCalledTimes(1);
```

Note that a provider should only be provided to this function once and should be recreated for every test