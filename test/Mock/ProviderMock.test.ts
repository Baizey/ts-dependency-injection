import { MockSetup, ServiceCollection, ShouldBeMockedDependencyError } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';

function setup(mock?: MockSetup<Provider>) {
  const services = new ServiceCollection<Provider>();
  services.addTransient(Alice, (p) => p.alice);
  services.addTransient(Bob, (p) => p.bob);
  services.addTransient(Dummy, (p) => p.dummy);
  return services.buildMock(mock);
}

describe('mock', () => {
  test('Root provided is normal', () => {
    const mock = {};
    const provider = setup({ alice: mock });

    const { alice, bob } = provider.proxy;

    expect(alice).toBeInstanceOf(Alice);
    expect(bob).toBeInstanceOf(Bob);
  });

  test('Mock function, succeed', () => {
    const mock = {
      getName(): string {
        return 'NotAlice';
      },
    };
    const spy = jest.spyOn(mock, 'getName');

    const provider = setup({ alice: mock });

    const { bob } = provider.proxy;

    const alice = bob.alice;
    expect(alice.getName()).toBe('NotAlice');
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock function, throw error', () => {
    const provider = setup();

    const { bob } = provider.proxy;

    const alice = bob.alice;

    expect(() => alice.getName()).toThrowError(new ShouldBeMockedDependencyError('alice', 'getName', 'get'));
  });

  test('Mock get, succeed', () => {
    const mock = {
      get getTest() {
        return undefined;
      },
    };
    const spy = jest.spyOn(mock, 'getTest', 'get');

    const provider = setup({ alice: mock });

    const { bob } = provider.proxy;

    const alice = bob.alice;
    expect(alice.getTest).toBeUndefined();
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock get, throw error', () => {
    const provider = setup();

    const { bob } = provider.proxy;

    const alice = bob.alice;
    expect(() => alice.getTest).toThrowError(new ShouldBeMockedDependencyError('alice', 'getTest', 'get'));
  });

  test('Mock set, succeed setting', () => {
    const mock = new Alice();
    const spy = jest.spyOn(mock, 'setTest', 'set');

    const provider = setup({ alice: mock });

    const { bob } = provider.proxy;

    const alice = bob.alice;
    alice.setTest = undefined;
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock set, throw error', () => {
    const provider = setup();

    const { bob } = provider.proxy;

    const alice = bob.alice;
    expect(() => {
      alice.setTest = undefined;
    }).toThrowError(new ShouldBeMockedDependencyError('alice', 'setTest', 'set'));
  });
});
