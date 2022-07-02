import { DependencyError } from './DependencyError'
import { DependencyErrorType } from './types'

export type Access = 'get' | 'set' | 'construct' | 'apply' | 'function'

export class ShouldBeMockedDependencyError extends Error implements DependencyError {
	readonly type: DependencyErrorType = DependencyErrorType.ShouldBeMocked
	readonly lifetime: string
	readonly property: string
	private access: Access
	
	constructor( lifetime: string, property: string, access: Access ) {
		super( `${access} ${lifetime}.${property} has been accessed, but it has a throw exception mocking strategy` )
		this.lifetime = lifetime
		this.property = property
		this.access = access
	}
}