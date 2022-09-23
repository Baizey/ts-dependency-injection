import {
  DuplicateDependencyError,
  MockStrategy,
  propertyOf,
  scoped,
  ScopedServiceProvider,
  ServiceCollection,
  Services,
  ShouldBeMockedDependencyError,
  singleton,
  stateful,
  transient,
} from '../src'
import { ScopedLifetime } from '../src/Lifetime/ScopedLifetime'
import { SingletonLifetime } from '../src/Lifetime/SingletonLifetime'
import { StatefulLifetime } from '../src/Lifetime/StatefulLifetime'
import { TransientLifetime } from '../src/Lifetime/TransientLifetime'
import { Context, dummy, dummyClass, UUID } from './testUtils'

class Dummy {
}

const services = propertyOf<ServiceCollection>()

describe( services.add, () => {
  test( 'add', () => {
    const sut = Services().add( { a: singleton( Dummy ) } )
    expect( sut.get( 'a' ) ).toBeTruthy()
  } )
  test( 'addSingleton', () => {
    const sut = Services()
    const spy = jest.spyOn( sut, 'add' )
    const actual = sut.add( { alice: singleton( Dummy ) } )
    expect( spy ).toBeCalledTimes( 1 )
    expect( actual.get( ( p ) => p.alice ) ).toBeInstanceOf( SingletonLifetime )
  } )
  test( 'addScoped', () => {
    const sut = Services()
    const spy = jest.spyOn( sut, 'add' )
    const actual = sut.add( { alice: scoped( Dummy ) } )
    expect( spy ).toBeCalledTimes( 1 )
    expect( actual.get( ( p ) => p.alice ) ).toBeInstanceOf( ScopedLifetime )
  } )
  test( 'addTransient', () => {
    const sut = Services()
    const spy = jest.spyOn( sut, 'add' )
    const actual = sut.add( { alice: transient( Dummy ) } )
    expect( spy ).toBeCalledTimes( 1 )
    expect( actual.get( ( p ) => p.alice ) ).toBeInstanceOf( TransientLifetime )
  } )
  test( 'addStateful', () => {
    const sut = Services()
    const spy = jest.spyOn( sut, 'add' )
    const actual = sut.add( { alice: stateful( Dummy ) } )
    expect( spy ).toBeCalledTimes( 1 )
    expect( actual.get( ( p ) => p.alice ) ).toBeInstanceOf( StatefulLifetime )
    expect( actual.get( 'alice' )?.provide( new ScopedServiceProvider( Context() ) ) ).toHaveProperty( 'create' )
  } )
  test( 'Adding twice should give duplicate error', () => {
    const sut = Services().add( { a: singleton( Dummy ) } )
    // @ts-ignore
    expect( () => sut.add( { a: singleton( Dummy ) } ) ).toThrowError( new DuplicateDependencyError( 'a' ) )
  } )
} )

describe( services.remove, () => {
  test( 'Service is removed', () => {
    const sut = Services().add( { a: singleton( Dummy ) } )
    const actual = sut.remove( 'a' )
    expect( actual.get( 'a' as any ) ).toBeUndefined()
  } )
  test( 'Service is removed and re-added', () => {
    const sut = Services()
      .add( { a: singleton( Dummy ) } )
      .remove( 'a' )
    const actual = sut.add( { a: singleton( Dummy ) } )
    expect( actual.get( 'a' ) ).toBeTruthy()
  } )
} )

describe( services.buildMock, () => {
  test( 'Default mock strategy should be followed', () => {
    const { a, sut } = dummy()
      .add( {
        a: singleton( dummyClass() ),
        sut: singleton( dummyClass( ( { a } ) => ( { a } ) ) ),
      } )
      .mock()
    expect( a.id ).toBeTruthy()
    expect( sut.a.id ).toBeNull()
  } )

  test( 'Given mock strategy should be followed', () => {
    const { sut } = dummy()
      .add( {
        a: singleton( dummyClass() ),
        sut: singleton( dummyClass( ( { a } ) => ( { a } ) ) ),
      } )
      .mock( {}, MockStrategy.exceptionStub )
    expect( () => sut.a.id ).toThrowError( new ShouldBeMockedDependencyError( 'a', 'id', 'get' ) )
  } )

  test( 'Dependency mock strategy should be followed', () => {
    const { sut } = dummy()
      .add( {
        a: singleton( dummyClass() ),
        b: singleton( dummyClass() ),
        c: singleton( dummyClass() ),
        sut: singleton( dummyClass( ( { a, b, c } ) => ( { a, b, c } ) ) ),
      } )
      .mock( {
        a: MockStrategy.dummyStub,
        b: MockStrategy.exceptionStub,
        c: { id: UUID.randomUUID() },
      } )

    expect( sut.a.id ).toBeNull()
    expect( () => sut.b.id ).toThrowError( new ShouldBeMockedDependencyError( 'b', 'id', 'get' ) )
    expect( sut.c.id ).toBeTruthy()
    sut.c.id = 'cake'
    expect( sut.c.id ).toBe( 'cake' )
  } )

  test( 'Property mock strategy should be followed', () => {
    const { sut } = dummy()
      .add( {
        a: singleton( dummyClass() ),
        sut: singleton( dummyClass( ( { a } ) => ( { a } ) ) ),
      } )
      .mock( {
        a: {
          id: MockStrategy.nullStub,
          func: MockStrategy.exceptionStub,
          get getter() {
            return UUID.randomUUID()
          },
        },
      } )
    expect( sut.a.id ).toBeNull()
    expect( () => sut.a.func() ).toThrowError( new ShouldBeMockedDependencyError( 'a', 'func', 'function' ) )
    expect( sut.getter ).toBeTruthy()
  } )

  test( 'Stateful instance should be given mocked dependencies', () => {
    const sut = dummy()
      .add( {
        scoped: scoped( dummyClass( ( { stateful } ) => ( { stateful } ) ) ),
        stateful: stateful( dummyClass( ( { stateful, scoped } ) => ( { stateful, scoped } ) ) ),
      } )
      .mock( MockStrategy.exceptionStub ).stateful
    expect( () => sut.create().scoped.stateful ).toThrowError(
      new ShouldBeMockedDependencyError( 'scoped', 'stateful', 'get' ),
    )
  } )

  test( 'Service with Stateful dependency should be given mocked Stateful', () => {
    const sut = dummy()
      .add( {
        scoped: scoped( dummyClass( ( { stateful } ) => ( { stateful } ) ) ),
        stateful: stateful( dummyClass( ( { stateful, scoped } ) => ( { stateful, scoped } ) ) ),
      } )
      .mock( MockStrategy.exceptionStub ).scoped
    expect( () => sut.stateful.create() ).toThrowError(
      new ShouldBeMockedDependencyError( 'stateful', 'create', 'function' ),
    )
  } )

  test( 'Service with MockStrategy realValue should return the real deal', () => {
    const sut = dummy()
      .add( {
        a: singleton( dummyClass( () => ( {} ) ) ),
        b: singleton( dummyClass( () => ( {} ) ) ),
        c: singleton( dummyClass( ( { a, b } ) => ( { a, b } ) ) ),
      } )
      .mock( {
        a: MockStrategy.realValue,
        b: MockStrategy.nullStub,
      } ).c

    expect( sut.a.id ).toBeTruthy()
    expect( sut.b.id ).toBeNull()
  } )
} )
