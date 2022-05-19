import { CircularDependencyError, ExistenceDependencyError } from '../Errors'
import { DependencyInfo, ILifetime } from '../Lifetime'
import { Key, LifetimeCollection, Selector } from '../ServiceCollection'
import { extractSelector, proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'

type Falsy = null | undefined | false | 0 | ''

export class ScopedServiceProvider<E = any> implements IServiceProvider<E> {
	readonly scope: Record<Key<any>, any>
	
	private readonly singletons: DependencyInfo[] = []
	private readonly lookup: Record<Key<any>, DependencyInfo> = {}
	private readonly ordered: DependencyInfo[] = []
	
	readonly lifetimes: LifetimeCollection<E>
	readonly proxy: E
	readonly root: IServiceProvider<E>
	readonly parent: IServiceProvider<E>
	
	constructor(parent: IServiceProvider<E>, lifetime?: ILifetime) {
		this.parent = parent
		this.lifetimes = parent.lifetimes
		this.root = parent.root
		this.proxy = proxyOf(this)
		
		this.scope = (parent instanceof ScopedServiceProvider) ? parent.scope : {}
		if (parent instanceof ScopedServiceProvider)
			parent.ordered.forEach(e => this._enter(e))
		if (lifetime) this._enter(lifetime)
	}
	
	private _isDone: boolean = false
	
	get isDone() {
		return this._isDone
	}
	
	get depth(): number {
		return this.ordered.length
	}
	
	get lastSingleton(): DependencyInfo<E> | undefined {
		return this.singletons[this.singletons.length - 1]
	}
	
	provide<T>(selector: Selector<T, E>): T {
		const lifetime = this.getLifetime(selector)
		const context = new ScopedServiceProvider(this, lifetime)
		const result = lifetime.provide(context)
		context._isDone = true
		return result
	}
	
	enter(lifetime: ILifetime | Falsy) {
		if (!lifetime) return this
		return new ScopedServiceProvider<E>(this, lifetime)
	}
	
	private _enter(lifetime: DependencyInfo) {
		if (lifetime.name in this.lookup) throw new CircularDependencyError(lifetime.name,
			this.ordered.map(e => e.name))
		this.ordered.push(lifetime)
		if (lifetime.isSingleton) this.singletons.push(lifetime)
		this.lookup[lifetime.name] = lifetime
	}
	
	private getLifetime<T>(selector: Selector<T, E>) {
		const key = extractSelector(selector)
		const lifetime = this.lifetimes[key] as ILifetime<T, E>
		if (!lifetime) throw new ExistenceDependencyError(key)
		return lifetime
	}
}