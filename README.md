# Sharp-Dependency-Injection

Simple type strong dependency injection

## Overlook

Note, this dependency injector does not use decorators. This means there are some limitations to the injection it can be.

With that said, it support Singleton, Scoped and Transient lifetimes, dependency injection for classes, types, strings, or anything else you could think of, excluding async resolving.


## Basic usage
Before the container
```
// A class such as this is required, it does not matter what the values are, just the types and that the properties will exist if created
class Provider {
  alice: Alice = null as unknown as Alice;
  connectionString: string = null as unknown as string;
  config: IConfiguration = null as unknown as IConfiguration;
}
```
Creating container and filling it
```
// Create the container, it will take the Provider and use it as a template for which dependencies it expects you to add to it
// A class has to have a new(provider: Provider) constructor to be eligable for dependency injection
const container = new Container(Provider);

// The simplest way to add dependencies is if you have a class where you can simply provide it like:
container.add(Scoped, Alice);

// For any non-class you need to give a factory function and a selector
container.add(Singleton, {selector: p => p.connectionString, factory: provider => 'stuff'});

// Similarly to non-classes you need to provide a selector if the class name does not match up with the property name (capitalization is ignored):
container.add<IConfiguration>(Singleton, {dependency: Configuration, selector: provider => provider.config})
```
Validating that dependencies are added and will be resolvable
```
// When building you can optionally set validation to true
// If validation is true then the provider will keep track of circular dependencies and Singletons trapping Scoped lifetimes
const validationProvider = container.build(true);

// validate is a simple function that will attempt to provide all properties of the Provider and return a collective error listing all problems found
validationProvider.validate();
```
Utilizing the provider
```
// A last validation to note is that if any properties havent been added an error will be thrown when building telling you what's missing
const provider = container.build();

// Lastly to use the provider you can simply de-construct or retrive them as if they were properties on Provider
const {alice, connectionString, config} = provider;

// Lifetimes are however respected, so this is a different alice than the de-constructed one
const alice = provider.alice;
```
Usage in testing
```
# When testing you can remove and replace dependencies as required, keeping it as close as possible to the real provider
const container: Container<Provider> = createContainerElsewhere();

container.remove(p => p.config);
container.add<IConfiguration>(Singleton, {dependency: MockConfiguration, selector: p => p.config})

```

### Extra details
It is not recommended, but you can add the provider itself to the dependency injection like:
```
class Provider {
    ...
    provider: Provider = null as unknown as Provider;
    ...
}
container.add(Transient, {factory: provider => provider, selector: p => p.provider})
```

Note that this does not mean you can retrieve scoped lifetimes from a singleton, that is never allowed

## Planned features

- built in react-hook
- built in express middleware
- middleware support in general