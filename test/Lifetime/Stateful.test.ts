import { ServiceCollection, ShouldBeMockedDependencyError, SingletonScopedDependencyError } from "../../src";
import {
  StatefulDependency1,
  StatefulDependency2,
  StatefulFactory,
  StatefulProvider,
  StatefulService
} from "../models/StatefulProvider";

test("Singleton dependency chain has scope restraints", () => {
  const services = new ServiceCollection<StatefulProvider>();
  services.addScoped(StatefulDependency1, "dep1");
  services.addScoped(StatefulDependency2, "dep2");
  services.addStateful(StatefulFactory, "factory");
  services.addSingleton(StatefulService, "service");

  const { service } = services.build().proxy;

  expect(() => service.create())
    .toThrowError(new SingletonScopedDependencyError("service", "dep1"));
});

test("Non-singleton dependency chain has no scope restraints", () => {
  const services = new ServiceCollection<StatefulProvider>();
  services.addScoped(StatefulDependency1, "dep1");
  services.addScoped(StatefulDependency2, "dep2");
  services.addStateful(StatefulFactory, "factory");
  services.addTransient(StatefulService, "service");

  const { service } = services.build().proxy;

  expect(service.create().dep.call()).toBeTruthy();
});

test("Stateful instance should be given mocked dependencies", () => {
  const services = new ServiceCollection<StatefulProvider>();
  services.addScoped(StatefulDependency1, "dep1");
  services.addScoped(StatefulDependency2, "dep2");
  services.addStateful(StatefulFactory, "factory");

  const { factory } = services.buildMock().proxy;

  expect(() => factory.create().dep.call())
    .toThrowError(new ShouldBeMockedDependencyError("dep1", "call", "get"));
});

test("Service with Stateful dependency should be given mocked Stateful", () => {
  const services = new ServiceCollection<StatefulProvider>();
  services.addScoped(StatefulDependency1, "dep1");
  services.addScoped(StatefulDependency2, "dep2");
  services.addStateful(StatefulFactory, "factory");
  services.addTransient(StatefulService, "service");

  const { service } = services.buildMock().proxy;

  expect(() => service.create())
    .toThrowError(new ShouldBeMockedDependencyError("factory", "create", "get"));
});