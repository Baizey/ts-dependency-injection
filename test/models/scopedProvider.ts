export class ScopedA {
	private static nextId: number = 0
	readonly aId: number
	
	constructor() {
		this.aId = ScopedA.nextId++
	}
}

export class ScopedB {
	private static nextId: number = 0
	readonly bId: number
	readonly a: ScopedA
	
	constructor({ a }: ScopedProvider) {
		this.a = a
		this.bId = ScopedB.nextId++
	}
}

export class ScopedC {
	private static nextId: number = 0
	readonly cId: number
	readonly a: ScopedA
	readonly b: ScopedB
	
	constructor({ b, a }: ScopedProvider) {
		this.a = a
		this.b = b
		this.cId = ScopedC.nextId++
	}
}

export interface ScopedProvider {
	a: ScopedA
	b: ScopedB
	c: ScopedC
}