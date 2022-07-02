import { v4 } from 'uuid'
import {
	DependencyMap,
	ILifetime,
	LifetimeConstructor,
	MockStrategy,
	propertyOf,
	ProviderMock,
	ScopedServiceProvider,
	ServiceCollection,
	ServiceProvider,
} from '../src'

export const propertyOfLifetime = propertyOf<ILifetime<any, any>>()

class NextNumber {
	private static nextNumber = 1
	
	static next() { return String( this.nextNumber++ )}
}

export const next = () => NextNumber.next()
export const UUID = { randomUUID(): string { return v4() } }

export const Lifetime = (Constructor: LifetimeConstructor) =>
	new Constructor(UUID.randomUUID(), () => UUID.randomUUID())

export const Provider = () => new ServiceProvider({})
export const Context = () => new ScopedServiceProvider(Provider())

export class InnerBase {
	id = UUID.randomUUID()
	
	get getter() {
		return this.id
	}
	
	set setter( value: any ) {
		this.id = value
	}
	
	func() {
		return this.id
	}
}

type Recursive<Current> =
	Required<{ [key in keyof Current]: Recursive<Current> }>
	& { create: () => Recursive<Current> } & InnerBase
type OnCreation = ( e: Recursive<any> ) => Partial<Recursive<any>> | undefined | null | void

export function dummyClass( onCreation?: OnCreation ) {
	return class Inner<E> extends InnerBase {
		constructor( provider: Recursive<E> ) {
			super()
			const data = onCreation && onCreation( provider )
			if (!data) return
			const self = this
			// @ts-ignore
			Object.entries( data ).forEach( ( [key, value] ) => self[key] = value )
		}
	}
}

// noinspection JSUnusedLocalSymbols
class Dummy<E = {}> {
	private services: ServiceCollection<E>
	
	constructor( services: ServiceCollection<E> = new ServiceCollection<E>() ) {
		this.services = services
	}
	
	static create() {
		return new Dummy()
	}
	
	add<KT, F extends DependencyMap<E, KT>>( dependencies: F & DependencyMap<E, KT> ) {
		return new Dummy( this.services.add( dependencies ) )
	}
	
	public build(): Recursive<E> {
		// @ts-ignore
		return this.services.build().proxy
	}
	
	public mock( mock: MockStrategy | ProviderMock<Recursive<E>> = {},
	             defaultMock?: MockStrategy ): Recursive<E> {
		// @ts-ignore
		return this.services.buildMock( mock, defaultMock ).proxy
	}
}

export const dummy = () => Dummy.create()