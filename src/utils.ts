import { DependencyInformation, Key, Selector, SelectorOptions, ServiceCollection } from './ServiceCollection'
import { IServiceProvider } from './ServiceProvider'

export type PropertyOf<E> = Required<{ [key in keyof E]: key & Key<E> }>

const _propertyOf = new Proxy( {}, { get: ( _, p ) => p } ) as any

export type ServiceProviderOf<T extends IServiceProvider> = T['proxy']
export type ServiceCollectionOf<T extends ServiceCollection<any>> = ServiceProviderOf<ReturnType<T['build']>>
export type FunctionOf<T extends ( ( ignored?: ServiceCollection<any> ) => ServiceCollection<any> ) | ( () => IServiceProvider )> =
  ReturnType<T> extends IServiceProvider
    ? ServiceProviderOf<ReturnType<T>>
    : ReturnType<T> extends ServiceCollection<any>
      ? ServiceCollectionOf<ReturnType<T>>
      : never

export const propertyOf = <T>() => _propertyOf as PropertyOf<T>

export const proxyOf = <E>( self: IServiceProvider<E> ) =>
  new Proxy( self, { get: ( t, p: Key<E> ) => t.provide( p ) } ) as unknown as E

export function extractSelector<T, E>( options: Selector<T, E> ): Key<E> {
  switch ( typeof options ) {
    case 'function':
      return options( propertyOf<SelectorOptions<T, E>>() )
    case 'symbol':
    case 'string':
      return options
    default:
      throw new Error( `extractSelector could not match anything` )
  }
}

type DependencyFromInformation<X> = X extends DependencyInformation<infer T, any> ? T : never
export type AsServices<X> = Required<{ [key in keyof X]: DependencyFromInformation<X[key]> }>