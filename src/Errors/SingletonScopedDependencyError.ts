import { Key } from '../ServiceCollection'
import { DependencyError } from './DependencyError'
import { DependencyErrorType } from './types'

export class SingletonScopedDependencyError extends Error implements DependencyError {
	readonly lifetime: string
	readonly cause: string
	readonly type: DependencyErrorType = DependencyErrorType.SingletonScoped
	
	constructor( lifetime: Key<any>, cause: Key<any> ) {
		super(
			`Singleton '${lifetime.toString()}' depends on scoped '${cause.toString()}', it is not allowed to as it would lock the scoped service into a singleton lifetime`,
		)
		this.lifetime = lifetime.toString()
		this.cause = cause.toString()
	}
}