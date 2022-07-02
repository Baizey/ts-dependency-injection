import { CircularDependencyError, ExistenceDependencyError } from '../Errors'
import { DependencyInfo, ILifetime } from '../Lifetime'
import { Key, LifetimeCollection, Selector } from '../ServiceCollection'
import { extractSelector, proxyOf } from '../utils'
import { IServiceProvider } from './IServiceProvider'
import { ServiceProvider } from './ServiceProvider'

type Falsy = null | undefined | false | 0 | ''

export class ScopedServiceProvider<E = any> implements IServiceProvider<E> {
	readonly instances: Record<Key<any>, any>
	readonly root: ServiceProvider<E>
	private _isDone: boolean = false
	private readonly lookup: Record<Key<any>, DependencyInfo> = {}
	private readonly ordered: DependencyInfo[] = []
	
	constructor( parent: IServiceProvider<E>, lifetime?: ILifetime<unknown, E> ) {
		this.parent = parent
		this.root = parent.root
		this.lifetimes = parent.lifetimes
		this.proxy = proxyOf( this )
		
		if (parent instanceof ScopedServiceProvider) {
			this.instances = parent.instances
			this._lastSingleton = parent.lastSingleton
			this.lookup = { ...parent.lookup }
			this.ordered = parent.ordered.map( e => e )
		} else {
			this.instances = {}
		}
		
		if (lifetime) this._enter( lifetime )
	}
	
	readonly lifetimes: LifetimeCollection<E>
	readonly proxy: E
	readonly parent: IServiceProvider<E>
	
	private _lastSingleton?: DependencyInfo
	
	get isDone() {
		return this._isDone
	}
	
	get depth(): number {
		return this.ordered.length
	}
	
	get lastSingleton(): DependencyInfo<E> | undefined {
		return this._lastSingleton
	}
	
	using( action: ( provider: E ) => any ): void {
		action( this.proxy )
		this._isDone = true
	}
	
	provide<T>( selector: Selector<T, E> ): T {
		const lifetime = this.getLifetime( selector )
		const context = new ScopedServiceProvider( this, lifetime )
		const result = lifetime.provide( context )
		context._isDone = true
		return result as T
	}
	
	enter( lifetime: ILifetime<any, E> | Falsy ) {
		if (!lifetime) return this
		return new ScopedServiceProvider<E>( this, lifetime )
	}
	
	private _enter( lifetime: DependencyInfo ) {
		if (lifetime.name in this.lookup) {
			throw new CircularDependencyError(
				lifetime.name,
				this.ordered.map( e => e.name ) )
		}
		this.ordered.push( lifetime )
		this._lastSingleton = lifetime.isSingleton
			? lifetime
			: this._lastSingleton
		this.lookup[lifetime.name] = lifetime
	}
	
	private getLifetime<T>( selector: Selector<T, E> ) {
		const key = extractSelector( selector )
		const lifetime = this.lifetimes[key] as ILifetime<T, E>
		if (!lifetime) throw new ExistenceDependencyError( key )
		return lifetime
	}
}