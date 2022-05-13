// noinspection JSUnusedLocalSymbols

import { v4 } from 'uuid'
import {
	ILifetime,
	LifetimeConstructor,
	Scoped,
	ScopedContext,
	ServiceCollection,
	ServiceProvider,
	Singleton,
	Transient,
} from '../src'
import { MockSetup } from '../src/ServiceCollection/mockUtils'
import { PropertyOf, propertyOf } from '../src/utils'

class NextNumber {
	private static nextNumber = 1
	
	static next() { return String(this.nextNumber++)}
}

export const next = () => NextNumber.next()
export const propertyOfLifetime = propertyOf as PropertyOf<ILifetime>
export const UUID = { randomUUID(): string { return v4() } }

export const Lifetime = (Constructor: LifetimeConstructor) =>
	new Constructor(UUID.randomUUID(), () => UUID.randomUUID())

export const Services = <T = any>() => new ServiceCollection<T>()
export const Provider = () => new ServiceProvider({})
export const Context = () => new ScopedContext(Provider())

class InnerBase {
	id = UUID.randomUUID()
	
	get getter() {
		return this.id
	}
	
	set setter(value: any) {
		this.id = value
	}
	
	func() {
		return this.id
	}
}

type Recursive<Current> =
	Required<{ [key in keyof Current]: Recursive<Current> }>
	& { create: () => Recursive<Current> } & InnerBase
type OnCreation<E> = (e: Recursive<E>) => Partial<Recursive<E>> | undefined | null | void

function createClass<Current>(onCreation: OnCreation<Current>) {
	return class Inner extends InnerBase {
		constructor(provider: Recursive<Current>) {
			super()
			const data = onCreation && onCreation(provider)
			if (!data) return
			const self = this
			// @ts-ignore
			Object.entries(data).forEach(([key, value]) => self[key] = value)
		}
	}
}

function addLifetime<Current>(services: ServiceCollection,
                              Constructor: LifetimeConstructor,
                              name: Key<Current>,
                              onCreation: OnCreation<Current>): ServiceCollection<Current> {
	const Inner = createClass(onCreation)
	services.add(Constructor, Inner, name)
	return services
}

type Key<E> = string & keyof E

class Dummy<Current = {}> {
	private readonly services: ServiceCollection
	
	constructor(services: ServiceCollection = new ServiceCollection()) {
		this.services = services
	}
	
	static create() {
		return new Dummy()
	}
	
	public build(): Recursive<Current> {
		return this.services.build().proxy
	}
	
	public mock(mock: MockSetup<Recursive<Current>> = {}): Recursive<Current> {
		return this.services.buildMock(mock).proxy
	}
	
	public add<Add extends { [key: string | symbol]: any }>(
		Lifetime: LifetimeConstructor,
		name: Key<Add>,
		onCreation: OnCreation<Add & Current> = () => {},
		expected?: Key<Add>[] | Key<Add>) {
		addLifetime<Add & Current>(this.services, Lifetime, name, onCreation)
		return new Dummy<Current & Add>(this.services)
	}
	
	public singleton<Add extends { [key: string | symbol]: any }>(
		name: Key<Add>,
		onCreation: OnCreation<Add & Current> = () => {},
		expected?: Key<Add>[] | Key<Add>) {
		return this.add(Singleton, name, onCreation)
	}
	
	public scoped<Add extends { [key: string | symbol]: any }>(
		name: Key<Add>,
		onCreation: OnCreation<Add & Current> = () => {},
		expected?: Key<Add>[] | Key<Add>) {
		return this.add(Scoped, name, onCreation)
	}
	
	public transient<Add extends { [key: string | symbol]: any }>(
		name: Key<Add>,
		onCreation: OnCreation<Add & Current> = () => {},
		expected?: Key<Add>[] | Key<Add>) {
		return this.add(Transient, name, onCreation)
	}
	
	public stateful<Add extends { [key: string | symbol]: any }>(
		name: Key<Add>,
		onCreation: OnCreation<Add & Current> = () => {},
		expected?: Key<Add>[] | Key<Add>) {
		const Constructor = createClass(onCreation)
		this.services.addStateful(Constructor, name)
		return new Dummy<Add & Current>(this.services)
	}
}

export const dummy = () => Dummy.create()