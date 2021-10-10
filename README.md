# Sharp-Dependency-Injection

Simple dependency injection


## Example usage 
```
// A Provider class such as this is required for this dependency injector
// It only requires that all fields are initiated by default, their value does not matter
// A simple hack is to do 'null as unknown as DesiredType' to avoid ts-ignore or other undesired effects
class Provider {
  alice: Alice = null as unknown as Alice;
  bob: Bob = null as unknown as Bob;
}

// A class provided by this dependency injector can have 1 of 2 different constructors
// Either with no parameters like Alice
// Or with 1 parameter, the Provider you specify yourself, like Bob
class Alice {
  private static nextId: number = 0;
  readonly id: number;

  constructor() {
    this.id = Alice.nextId++;
  }
}

// You can unwrap the Provider for the desired properties you need
// They will underlyingly use their correct life-cycles (transient, scoped, singleton)
export class Bob {
  private static nextId: number = 0;
  readonly id: number;
  readonly alice: Alice;

  constructor({ alice }: Provider) {
    this.alice = alice;
    this.id = Bob.nextId++;
  }
}

// Creates container based on a Provider to make it type strong
const container = new Container(Provider);

// Only required field is the Dependency, i.e. Alice or Bob in this case
// factory is an optional customization of the factory function, by default its (provider) => new Dependency(provider)
// name is a linking tool between a class e.g. Bob and the provider field you want it called as, this is required if they are not the same (ignored casing)
container.addSingleton(Alice, {factory: provider => new Alice(), name: provider => provider.alice});
container.addSingleton(Bob);

// The build process will auto-validate that all dependencies expected by Provider exists
const provider = container.build();

// .validate() will do a dummy initialization of all dependencies and throw errors if there are any circular dependencies
provider.validate();

// the provider is in this case type Provider & InternalProvider (provides .validate() and .get(...))
// All property fields of Provider will be using underlying ILifetime to correctly handle life cycles
const bob = provider.bob;
const alice = provider.alice;

```
