import { ServiceProvider } from '../ServiceProvider';
import { ShouldBeMockedDependencyError } from '../Errors/ShouldBeMockedDependencyError';

export class Describer {
  static describe(val: any, found: Record<string, boolean> = {}): string[] {
    if (val === undefined || val == null) return [];
    const keys = Object.getOwnPropertyNames(val).concat(Describer.describe(Object.getPrototypeOf(val)));
    if (keys.every((e) => found[e])) return Object.keys(found);
    const dict = keys.reduce((a, b) => ({ ...a, [b]: true }), found);
    return Describer.describe(val.constructor.prototype, dict);
  }
}

export const ProviderMock = {
  /**
   * Turns provider into a mock-fixture
   * when directly asked to provide it will provide a proper instance
   * Anything the proper instance depend on will be mocked, but still provided
   * Note this will still respect lifetimes (i.e. if a singleton is requested multiple times it will be the same instance)
   * Any function called on dependencies will by default throw an error which you need to override with something like jest.spyOn(..).returns(..)
   * Any other property will be defaulted to undefined
   * Note this is not true for dynamic functions and properties which gets set or changed outside of the dependency injection
   */
  mock: <E>(
    provider: ServiceProvider<E>,
    setup?: {
      [key in keyof E]?: (mockedValue: Required<E>[key], provider: ServiceProvider<E>) => void;
    },
  ) => {
    const {
      _: { services },
    } = provider;
    const { template } = services;

    Object.keys(template)
      .map((k) => k as keyof E)
      .forEach((key) => {
        const lifetime = services.get(key as string);
        if (!lifetime) return;
        const originalFactory = lifetime.factory;
        lifetime.factory = (provider) => {
          const depth = Object.keys(provider._.validation.trail).length;
          switch (depth) {
            // Return SUT instance as expected
            case 1:
              return originalFactory(provider);
            // Instantiate dependencies and let the setup function do what it needs
            // This is required as need to have all expected properties on the object
            case 2:
            default:
              // Instantiate dependencies as we need to have all their properties existing
              const value = originalFactory(provider) as E[keyof E];
              let keys = Describer.describe(value);
              keys.forEach((k) => {
                if (
                  // @ts-ignore
                  (value.__lookupGetter__ && value.__defineGetter__ && value.__lookupGetter__(k)) ||
                  // @ts-ignore
                  (value.__lookupSetter__ && value.__defineSetter__ && value.__lookupSetter__(k))
                ) {
                  // @ts-ignore
                  if (value.__lookupGetter__ && value.__defineGetter__ && value.__lookupGetter__(k)) {
                    // @ts-ignore
                    value.__defineGetter__(k, () => {
                      throw new ShouldBeMockedDependencyError(lifetime.name, k, 'get');
                    });
                  }

                  // @ts-ignore
                  if (value.__lookupSetter__ && value.__defineSetter__ && value.__lookupSetter__(k)) {
                    // @ts-ignore
                    value.__defineSetter__(k, () => {
                      throw new ShouldBeMockedDependencyError(lifetime.name, k, 'set');
                    });
                  }
                  return;
                }

                // @ts-ignore
                if (typeof value[k] === 'function') {
                  // @ts-ignore
                  value[k] = () => {
                    throw new ShouldBeMockedDependencyError(lifetime.name, k, 'function');
                  };
                  return;
                }
              });

              // Let the user provide whichever mock-overlay desired
              const config = setup?.[key];
              if (config) config(value, provider);

              return value;
          }
        };
      });

    return provider;
  },
};
