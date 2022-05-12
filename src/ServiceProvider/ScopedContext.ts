import { CircularDependencyError, ExistenceDependencyError } from '../Errors'
import { DependencyInfo, ILifetime } from '../Lifetime'
import { Key, Selector, ServiceCollection } from '../ServiceCollection'
import { IServiceProvider } from './IServiceProvider'

export type ProviderScope = Record<Key<any>, any>;

export class ScopedContext<E> implements IServiceProvider<E> {
	readonly lifetimes: Record<Key<E>, ILifetime<any, E>>
	readonly proxy: E
	readonly scope: ProviderScope
	private readonly singletons: DependencyInfo[] = []
	private readonly lookup: Record<Key<any>, DependencyInfo> = {}
	private readonly ordered: DependencyInfo[] = []
	
	constructor(parent: IServiceProvider<E>) {
		const self = this
		this.lifetimes = parent.lifetimes
		this.scope = (parent instanceof ScopedContext) ? parent.scope : {}
		this.proxy = new Proxy(
			{},
			{
				get: (target, prop: Key<E>) => self.provide(prop),
			},
		) as E
	}
	
	get depth(): number {
		return this.ordered.length
	}
	
	get lastSingleton(): DependencyInfo<E> | undefined {
		return this.singletons[this.singletons.length - 1]
	}
	
	enter(lifetime: DependencyInfo) {
		if (lifetime.name in this.lookup) throw new CircularDependencyError(lifetime.name,
			this.ordered.map(e => e.name))
		this.ordered.push(lifetime)
		if (lifetime.isSingleton) this.singletons.push(lifetime)
		this.lookup[lifetime.name] = lifetime
	}
	
	leave(lifetime: DependencyInfo) {
		const last = this.ordered.pop()
		if (last?.isSingleton) this.singletons.pop()
		delete this.lookup[lifetime.name]
	}
	
	provide<T>(selector: Selector<T, E>): T {
		const lifetime = this.getLifetime(selector)
		this.enter(lifetime)
		const result = lifetime.provide(this)
		this.leave(lifetime)
		return result
	}
	
	private getLifetime<T>(selector: Selector<T, E>) {
		const key = ServiceCollection.extractSelector(selector)
		const lifetime = this.lifetimes[key]
		if (!lifetime) throw new ExistenceDependencyError(key)
		return lifetime
	}
}