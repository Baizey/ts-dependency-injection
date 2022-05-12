export interface Provider {
	alice: Alice
	bob: Bob
	dummy: Dummy
}

export class Alice {
	private static nextId: number = 0
	aliceParameter: null
	readonly id: number
	
	constructor() {
		this.id = Alice.nextId++
		this.aliceParameter = null
	}
	
	get getTest() {
		return undefined
	}
	
	// noinspection JSUnusedLocalSymbols
	set setTest(value: any) {
		this.aliceParameter = null
	}
	
	getName() {
		return 'alice'
	}
}

export class Bob {
	private static nextId: number = 0
	readonly bobParameter: null
	readonly id: number
	readonly alice: Alice
	
	constructor({ alice }: Provider) {
		this.id = Bob.nextId++
		this.alice = alice
		this.bobParameter = null
	}
}

export class Dummy {
	readonly dummyParameter: null
	
	constructor() {
		this.dummyParameter = null
	}
}