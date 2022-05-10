import { ServiceCollection, Stateful } from "../../src";

export type StatefulProvider = {
  scoped: StatefulService
  stateful: Stateful<void, StatefulFactory>
  singleton: StatefulService
  transient: StatefulService
}

export const statefulProvider = (mock?: boolean) => {
  const services = new ServiceCollection<StatefulProvider>();
  services.addScoped(StatefulService, e => e.scoped);
  services.addStateful(StatefulFactory, e => e.stateful);
  services.addSingleton(StatefulService, e => e.singleton);
  services.addTransient(StatefulService, e => e.transient);
  return (mock ? services.buildMock() : services.build()).proxy;
};

export class StatefulFactory {
  readonly scoped: StatefulService;
  private stateful: Stateful<void, StatefulFactory>;

  constructor({ stateful, scoped }: StatefulProvider) {
    this.stateful = stateful;
    this.scoped = scoped;
  }
}

export class StatefulService {
  readonly stateful: Stateful<void, StatefulFactory>;

  constructor({ stateful }: StatefulProvider) {
    this.stateful = stateful;
  }
}