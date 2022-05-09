import { Stateful } from "../../src";

export type StatefulProvider = {
  dep1: StatefulDependency1
  dep2: StatefulDependency2
  factory: Stateful<void, StatefulFactory>
  service: StatefulService
}

export class StatefulDependency2 {
  call() {
    return true;
  }
}

export class StatefulDependency1 {
  readonly dep2: StatefulDependency2;

  constructor({ dep2 }: StatefulProvider) {
    this.dep2 = dep2;
  }

  call() {
    return this.dep2.call();
  }
}

export class StatefulFactory {
  readonly dep: StatefulDependency1;

  constructor({ dep1 }: StatefulProvider) {
    this.dep = dep1;
  }
}

export class StatefulService {
  readonly factory: Stateful<void, StatefulFactory>;

  constructor({ factory }: StatefulProvider) {
    this.factory = factory;
  }

  create() {
    return this.factory.create();
  }
}