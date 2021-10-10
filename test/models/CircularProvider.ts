export class CircularProvider {
  CircularA = null as unknown as CircularA;
  CircularB = null as unknown as CircularB;
}

export class CircularA {
  CircularB: CircularB;

  constructor({ CircularB }: CircularProvider) {
    this.CircularB = CircularB;
  }
}

export class CircularB {
  CircularA: CircularA;

  constructor({ CircularA }: CircularProvider) {
    this.CircularA = CircularA;
  }
}