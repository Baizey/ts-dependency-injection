export class CircularProvider {
  CircularA?: CircularA;
  CircularB?: CircularB;
}

type P = Required<CircularProvider>;

export class CircularA {
  CircularB: CircularB;

  constructor({ CircularB }: P) {
    this.CircularB = CircularB;
  }
}

export class CircularB {
  CircularA: CircularA;

  constructor({ CircularA }: P) {
    this.CircularA = CircularA;
  }
}
