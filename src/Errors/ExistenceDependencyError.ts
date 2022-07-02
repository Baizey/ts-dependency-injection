import { Key } from '../ServiceCollection'
import { DependencyError } from './DependencyError'
import { DependencyErrorType } from './types'

export class ExistenceDependencyError extends Error implements DependencyError {
	readonly type: DependencyErrorType = DependencyErrorType.Existence
	readonly lifetime: string
	
	constructor( lifetime: Key<any> ) {
		super( `'${lifetime.toString()}' has not been added to dependency collection, but it was supposed to, wasn't it?` )
		this.lifetime = lifetime.toString()
	}
}