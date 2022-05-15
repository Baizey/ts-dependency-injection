import { CircularDependencyError, ExistenceDependencyError } from '../Errors'
import { DependencyInfo } from '../Lifetime'
import { Key, LifetimeCollection, Selector } from '../ServiceCollection'
import { extractSelector, proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'

export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E = any> implements IServiceProvider<E> {
	private readonly singletons: DependencyInfo[] = []
	private readonly lookup: Record<Key<any>, DependencyInfo> = {}
	private readonly ordered: DependencyInfo[] = []
	
	readonly lifetimes: LifetimeCollection<E>
	readonly proxy: E
	readonly scope: ProviderScope
	
	constructor(parent: IServiceProvider<E>) {
		this.lifetimes = parent.lifetimes
		this.proxy = proxyOf(this)
		this.scope = (parent instanceof ScopedContext) ? parent.scope : {}
	}
	
	get depth(): number {
		return this.ordered.length
	}
	
	get lastSingleton(): DependencyInfo<E> | undefined {
		return this.singletons[this.singletons.length - 1]
	}
	
	provide<T>(selector: Selector<T, E>): T {
		const lifetime = this.getLifetime(selector)
		return this.enterOnce(lifetime, () => lifetime.provide(this) as T)
	}
	
	enter<T>(lifetime: DependencyInfo[], action: (context: ScopedContext<E>) => T) {
		lifetime.forEach(e => this._enter(e))
		const result = action(this)
		lifetime.forEach(e => this._leave(e))
		return result
	}
	
	enterOnce<T>(lifetime: DependencyInfo, action: (context: ScopedContext<E>) => T) {
		this._enter(lifetime)
		const result = action(this)
		this._leave(lifetime)
		return result
	}
	
	private _enter(lifetime: DependencyInfo) {
		if (lifetime.name in this.lookup) throw new CircularDependencyError(lifetime.name,
			this.ordered.map(e => e.name))
		this.ordered.push(lifetime)
		if (lifetime.isSingleton) this.singletons.push(lifetime)
		this.lookup[lifetime.name] = lifetime
	}
	
	private _leave(lifetime: DependencyInfo) {
		const last = this.ordered.pop()
		if (last?.isSingleton) this.singletons.pop()
		delete this.lookup[lifetime.name]
	}
	
	private getLifetime<T>(selector: Selector<T, E>) {
		const key = extractSelector(selector)
		const lifetime = this.lifetimes[key]
		if (!lifetime) throw new ExistenceDependencyError(key)
		return lifetime
	}
}