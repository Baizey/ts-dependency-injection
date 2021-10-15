import { Provider } from './Provider';

export class ScopedA {
  private static nextId: number = 0;
  readonly aId: number;

  constructor() {
    this.aId = ScopedA.nextId++;
  }
}

export class ScopedB {
  private static nextId: number = 0;
  readonly bId: number;
  readonly a: ScopedA;

  constructor({ a }: P) {
    this.a = a;
    this.bId = ScopedB.nextId++;
  }
}

export class ScopedC {
  private static nextId: number = 0;
  readonly cId: number;
  readonly a: ScopedA;
  readonly b: ScopedB;

  constructor({ b, a }: P) {
    this.a = a;
    this.b = b;
    this.cId = ScopedC.nextId++;
  }
}

export class ScopedProvider {
  a?: ScopedA;
  b?: ScopedB;
  c?: ScopedC;
}

type P = Required<ScopedProvider>;
