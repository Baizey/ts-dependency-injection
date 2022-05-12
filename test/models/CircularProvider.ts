export interface CircularProvider {
	CircularA: CircularA;
	CircularB: CircularB;
}

export class CircularA {
	CircularB: CircularB
	
	constructor({ CircularB }: CircularProvider) {
		this.CircularB = CircularB
	}
}

export class CircularB {
	CircularA: CircularA
	
	constructor({ CircularA }: CircularProvider) {
		this.CircularA = CircularA
	}
}