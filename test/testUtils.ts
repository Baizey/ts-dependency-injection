import { v4 } from 'uuid'
import {
	ILifetime,
	LifetimeConstructor,
	propertyOf,
	Scoped,
	ScopedContext,
	ServiceCollection,
	ServiceProvider,
	Singleton,
	Transient,
} from '../src'
import { MockSetup } from '../src/ServiceCollection/mockUtils'

class NextNumber {
	private static nextNumber = 1
	
	static next() { return String(this.nextNumber++)}
}

export const next = () => NextNumber.next()
export const propertyOfLifetime = propertyOf<ILifetime>()
export const UUID = { randomUUID(): string { return v4() } }

export const Lifetime = (Constructor: LifetimeConstructor) =>
	new Constructor(UUID.randomUUID(), () => UUID.randomUUID())

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

function createClass<Current>(onCreation?: OnCreation<Current>) {
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

type Key<E> = string & keyof E

// noinspection JSUnusedLocalSymbols
class Dummy<Current = {}> {
	private readonly services: ServiceCollection<Current>
	
	constructor(services: ServiceCollection<Current> = new ServiceCollection<Current>()) {
		this.services = services
	}
	
	static create() {
		return new Dummy()
	}
	
	public build(): Recursive<Current> {
		// @ts-ignore
		return this.services.build().proxy
	}
	
	public mock(mock: MockSetup<Recursive<Current>> = {}): Recursive<Current> {
		// @ts-ignore
		return this.services.buildMock(mock).proxy
	}
	
	add<KE>(
		Lifetime: LifetimeConstructor,
		name: keyof KE & Key<KE>,
		Dependency?: OnCreation<Current & { [key in keyof KE]: Recursive<Current> }>,
		extra?: keyof KE & Key<KE> | (keyof KE & Key<KE>)[],
	): Dummy<{ [key in keyof KE]: Recursive<Current> } & Current> {
		const Constructor = createClass(Dependency)
		// @ts-ignore
		const next = this.services.add<Recursive<Current>, KE>(Lifetime, name, Constructor)
		return new Dummy<{ [key in keyof KE]: Recursive<Current> } & Current>(next)
	}
	
	singleton<KE>(
		name: keyof KE & Key<KE>,
		Dependency?: OnCreation<Current & { [key in keyof KE]: Recursive<Current> }>,
		extra?: keyof KE & Key<KE> | (keyof KE & Key<KE>)[],
	): Dummy<{ [key in keyof KE]: Recursive<Current> } & Current> {
		return this.add(Singleton, name, Dependency)
	}
	
	scoped<KE>(
		name: keyof KE & Key<KE>,
		Dependency?: OnCreation<Current & { [key in keyof KE]: Recursive<Current> }>,
		extra?: keyof KE & Key<KE> | (keyof KE & Key<KE>)[],
	): Dummy<{ [key in keyof KE]: Recursive<Current> } & Current> {
		return this.add(Scoped, name, Dependency)
	}
	
	transient<KE>(
		name: keyof KE & Key<KE>,
		Dependency?: OnCreation<Current & { [key in keyof KE]: Recursive<Current> }>,
		extra?: keyof KE & Key<KE> | (keyof KE & Key<KE>)[],
	): Dummy<{ [key in keyof KE]: Recursive<Current> } & Current> {
		return this.add(Transient, name, Dependency)
	}
	
	stateful<KE>(
		name: keyof KE & Key<KE>,
		Dependency?: OnCreation<Current & { [key in keyof KE]: Recursive<Current> }>,
		extra?: keyof KE & Key<KE> | (keyof KE & Key<KE>)[],
	): Dummy<{ [key in keyof KE]: Recursive<Current> } & Current> {
		const Constructor = createClass(Dependency)
		// @ts-ignore
		const next = this.services.addStateful<Recursive<Current>, void, KE>(name, Constructor)
		// @ts-ignore
		return new Dummy<{ [key in keyof KE]: Recursive<Current> } & Current>(next)
	}
}

export const dummy = () => Dummy.create()