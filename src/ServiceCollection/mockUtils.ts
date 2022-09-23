import { Access, ShouldBeMockedDependencyError } from '../Errors'
import { ILifetime } from '../Lifetime'
import { ScopedServiceProvider } from '../ServiceProvider'
import { propertyOf } from '../utils'
import { ServiceCollection } from './ServiceCollection'
import { DependencyFactory, Key } from './types'

export enum MockStrategy {
  /**
   * ONLY HERE FOR DOCUMENTATION PURPOSES, DO NOT USE IN CODE
   *
   * Default behaviour for any dependency/dependency property given in the ProviderMock that isn't a MockStrategy
   * Getter usage will return most recent dummy value (either the initial value, or a later set value)
   * Setter usage will set new dummy value
   */
  dummyStub = 'dummyStub',

  /**
   * This is the default behaviour unless otherwise explicitly stated
   *
   * Getter usage will return null
   * Setter usage will do nothing
   */
  nullStub = 'nullStub',

  /**
   * Getter usage will throw NotMockedException(dependency, prop, usage-type)
   * Setter usage will throw NotMockedException(dependency, prop, usage-type)
   */
  exceptionStub = 'exceptionStub',

  /**
   * Returns the real value, anything with this strategy won't be mocked at all
   */
  realValue = 'realValue',
}

type PartialNested<T> = { [key in keyof T]?: T[key] extends object ? PartialNested<T[key]> : T[key] };
type PropertyMock<T> = { [key in keyof T]?: PartialNested<T[key]> | MockStrategy | null | ( () => null ) };
type DependencyMock<E, K extends keyof E> =
  | Partial<PropertyMock<E[K]>>
  | DependencyFactory<Partial<PropertyMock<E[K]>>, any, E>
  | MockStrategy;
export type ProviderMock<E> = { [key in keyof E]?: DependencyMock<E, key> };

export function proxyLifetimes<E>(
  services: ServiceCollection<E>,
  providerMock: MockStrategy | ProviderMock<E>,
  defaultMock: MockStrategy = MockStrategy.nullStub,
) {
  if ( typeof providerMock === 'string' ) {
    defaultMock = providerMock as MockStrategy
  }
  const dependencyMock: ProviderMock<E> = typeof providerMock === 'string' ? {} : providerMock

  const provider = services.build()
  Object.values<ILifetime<unknown, E>>( provider.lifetimes ).forEach( ( lifetime ) => {
    const propertyMock = dependencyMock[lifetime.name] ?? defaultMock
    if ( propertyMock !== MockStrategy.realValue )
      provider.lifetimes[lifetime.name] = proxyLifetime( lifetime, propertyMock, defaultMock )
  } )
  return provider
}

const provide = propertyOf<ILifetime<unknown, any>>().provide

export function proxyLifetime<E>(
  lifetime: ILifetime<unknown, E>,
  dependencyMock: DependencyMock<E, keyof E>,
  defaultMock: MockStrategy,
) {
  const name = lifetime.name.toString()
  return new Proxy( lifetime, {
    get( target, prop: keyof ILifetime<unknown, E> ) {
      if ( prop !== provide ) return target[prop]
      return ( context: ScopedServiceProvider<E> ) => {
        if ( context.depth === 1 ) return target.provide( context )

        const shadow = target.provide( context )

        switch ( typeof dependencyMock ) {
          case 'string':
            return mockDependency( name, shadow, {}, dependencyMock )
          case 'function':
            return mockDependency( name, shadow, dependencyMock( context.proxy, undefined, context ), defaultMock )
          case 'object':
            return mockDependency( name, shadow, dependencyMock, defaultMock )
          default:
            return mockDependency( name, shadow, {}, defaultMock )
        }
      }
    },
  } )
}

export function mockDependency<T extends object>(
  name: string,
  shadowInstance: any,
  propertyMock: PropertyMock<T>,
  defaultMock: MockStrategy,
): T {
  function isFunc( prop: any ) {
    return typeof shadowInstance[prop] === 'function'
  }

  function mockValue( prop: Key<T>, mockType: MockStrategy, type: Access ) {
    switch ( mockType ) {
      case MockStrategy.realValue:
        return shadowInstance[prop]
      case MockStrategy.exceptionStub:
        if ( !isFunc( prop ) ) throw new ShouldBeMockedDependencyError( name, prop, type )
        return () => {
          throw new ShouldBeMockedDependencyError( name, prop, 'function' )
        }
      case MockStrategy.nullStub:
      default:
        return isFunc( prop ) ? () => null : null
    }
  }

  // noinspection JSUnusedGlobalSymbols
  const proxy = new Proxy( propertyMock, {
    get( target, prop: Key<T> ) {
      const value = target[prop]
      const mockType = value as MockStrategy

      if ( prop in target && mockType in MockStrategy ) {
        return mockValue( prop, mockType, 'get' )
      } else if ( prop in target || Object.getOwnPropertyDescriptor( target, prop )?.get ) {
        return value
      } else {
        return mockValue( prop, defaultMock, 'get' )
      }
    },
    set( target, prop: Key<T>, newValue ) {
      const value = target[prop]
      const mockType = value as MockStrategy

      if ( prop in target && mockType in MockStrategy ) {
        target[prop] = mockValue( prop, mockType, 'set' )
      } else if ( prop in target || Object.getOwnPropertyDescriptor( target, prop )?.set ) {
        target[prop] = newValue
      } else {
        target[prop] = mockValue( prop, defaultMock, 'set' )
      }

      return true
    },
  } ) as PropertyMock<T>

  return proxy as T
}
