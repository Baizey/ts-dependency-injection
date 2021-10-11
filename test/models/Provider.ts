export class Provider {
  alicE: Alice = null as unknown as Alice;
  boB: Bob = null as unknown as Bob;
  totalWhackYo: Dummy = null as unknown as Dummy;
}

export class Alice {
  private static nextId: number = 0;
  readonly aliceParameter: null = null;
  readonly id: number;

  constructor() {
    this.id = Alice.nextId++;
  }
}

export class Bob {
  private static nextId: number = 0;
  readonly bobParameter: null = null;
  readonly id: number;
  readonly a: Alice;

  constructor({ alicE }: Provider) {
    this.a = alicE;
    this.id = Bob.nextId++;
  }
}

export class Dummy {
  readonly dummyParameter: null = null;
}
