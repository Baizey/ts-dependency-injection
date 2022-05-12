import { DependencyErrorType } from './types'

export class ShouldBeMockedDependencyError extends Error {
	readonly lifetime: string
	readonly property: string
	readonly type: DependencyErrorType = DependencyErrorType.ShouldBeMocked
	private access: 'get' | 'set' | 'construct' | 'apply'
	
	constructor(lifetime: string, property: string, access: 'get' | 'set' | 'construct' | 'apply') {
		super(`${access} ${lifetime}.${property} was called in a mocked provider, you need to provide a mock for it`)
		this.lifetime = lifetime
		this.property = property
		this.access = access
	}
}