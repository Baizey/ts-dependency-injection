# Sharp-Dependency-Injection

Simple type strong dependency injection

## Overlook

### Lifetimes
- Singleton
- Transient
- Scoped [To be implemented]

### Providable

anything with a constructor() or constructor(provider: Provider)

### Container functions
- addSingleton (throws on adding duplicate)
- addTransient (throws on adding duplicate)
- add (throws on adding duplicate)
- tryAdd (boolean on if it added anything)
- get (Lifetime | undefined)
- remove (boolean on if it removed anything)
## Usage

### Setting up Provider types
For your side of using the dependency injector you have to do 2 things
- Create a Provider class
- have add the dependencies to the container

A Provider class can be something like: (you can avoid the null as unknown as Type if you use babel-prefill)
```
class Provider {
  alice: Alice = null as unknown as Alice;
  bob: Bob = null as unknown as Bob;
  config: IConfiguration = null as unknown as IConfiguration;
}
```

### Creating the container
Adding dependencies is done in a way that should be familiar to anyone who has used a di in C#
```
const container = new Container(Provider);
container.addTransient(Alice);
container.addTransient(Bob, {factory: provider => new Bob(provider, 'hello world')});
container.addSingleton<IConfiguration>(Configuration, {selector: provider => provider.config})
```
Note here that the default factory is: `(provider) => new Dependency(provider)`

The only required parameter is the initial class, the selector is required if the provider name does not match the class name

### Building the provider
```
const provider = container.build();
```
It will throw an error if any of the providers dependencies haven't been provided. 

When it is built you can also do `provider.validate()` which will validate that every dependency can be provided

This should only be done in a separate unit test to ensure functionality

### What you need to do on the Dependencies
There is one caveat with the design of this dependency injector, I do not want to use decorators or similar 'magic'

This means I cannot know the constructor of any of the dependencies, instead the constructor is enforced to be 

```
{ prototype: T, name: string, new(provider: Provider): T }
```

This is however not horrible thanks to the deconstruction functionality of JavaScript, which allows you to write constructors like:
```
class Bob {
    private alice: Alice;
    private config: IConfiguration;
    
    constructor({alice, config}: Provider){
        this.alice = alice;
        this.config = config;
    }
}
```
## Global usage
Great, a provider can be created, but how would you easily access it anywhere? A simple answer, Singleton patten.

The container has 2 static functions 
```
getOrCreate<T>(factory?: () => Container<T>): Provider
getOrCreateAsync<T>(factory?: () => Promise<Container<T>>): Promise<Provider>
```
These can be used globally to get the same instance of the provider anywhere

If it's called without a factory function it throws an error if there is no pre-existing provider