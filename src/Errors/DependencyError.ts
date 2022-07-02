import { DependencyErrorType } from './types'

export interface DependencyError extends Error {
	readonly type: DependencyErrorType
}

export class CollectionDependencyError extends Error implements DependencyError {
	public readonly type: DependencyErrorType = DependencyErrorType.Collection
	readonly errors: DependencyError[]
	
	constructor( errors: DependencyError[] ) {
		super( `Several dependency errors has occured, tl;dr:\n${errors.map( e => e.message ).join( '\n' )}` )
		this.errors = errors
	}
	
}