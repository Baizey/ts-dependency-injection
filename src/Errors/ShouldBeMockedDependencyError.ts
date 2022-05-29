import { DependencyErrorType } from './types'

export type Access = 'get' | 'set' | 'construct' | 'apply' | 'function'

export class ShouldBeMockedDependencyError extends Error {
	readonly lifetime: string
	readonly property: string
	readonly type: DependencyErrorType = DependencyErrorType.ShouldBeMocked
	private access: Access
	
	constructor(lifetime: string, property: string, access: Access) {
		super(`${access} ${lifetime}.${property} was called in a mocked provider, you need to provide a mock for it`)
		this.lifetime = lifetime
		this.property = property
		this.access = access
	}
}