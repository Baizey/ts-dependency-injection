import { Key } from '../ServiceCollection'
import { DependencyError } from './DependencyError'
import { DependencyErrorType } from './types'

export class CircularDependencyError extends Error implements DependencyError {
	readonly type: DependencyErrorType = DependencyErrorType.Circular
	readonly lifetime: string
	readonly provided: Key<any>[]
	
	constructor( lifetime: Key<any>, provided: Key<any>[] ) {
		super(
			`'${lifetime.toString()}' has circular dependency in the chain: '${provided
				.map( ( e ) => e.toString() )
				.join( ' > ' )}'. Two dependencies cannot depend on each other no matter how long the chain is between them`,
		)
		this.lifetime = lifetime
		this.provided = provided
	}
}