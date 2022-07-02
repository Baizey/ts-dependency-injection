import { Key } from '../ServiceCollection'
import { DependencyError } from './DependencyError'
import { DependencyErrorType } from './types'

export class DuplicateDependencyError extends Error implements DependencyError {
	readonly type: DependencyErrorType = DependencyErrorType.Duplicate
	readonly lifetime: string
	
	constructor( lifetime: Key<any> ) {
		super(
			`'${lifetime.toString()}' has already been added to dependency collection, use remove beforehand if you want to replace it`,
		)
		this.lifetime = lifetime.toString()
	}
}