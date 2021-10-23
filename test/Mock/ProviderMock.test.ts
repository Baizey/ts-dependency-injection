import { ProviderMock, ServiceCollection } from '../../src';
import { Alice, Bob, Dummy, Provider } from '../models';
import { ShouldBeMockedDependencyError } from '../../src/Errors/ShouldBeMockedDependencyError';

describe('mock', () => {
  test('Mock override function', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    let spy;
    ProviderMock.mock(provider, {
      alicE: function (mock) {
        spy = jest.spyOn(mock, 'getName').mockReturnValue('Bob');
      },
    });

    const { a } = provider.boB;

    expect(a.getName()).toBe('Bob');
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock override function, throw error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a } = provider.boB;

    expect(() => a.getName()).toThrowError(new ShouldBeMockedDependencyError('alicE', 'getName', 'function'));
  });

  test('Mock override get, throw error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    let spy;
    ProviderMock.mock(provider, {
      alicE: function (mock) {
        spy = jest.spyOn(mock, 'getTest', 'get').mockReturnValue(undefined);
      },
    });

    const { a } = provider.boB;

    expect(a.getTest).toBeUndefined();
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock override get, throw error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a } = provider.boB;

    expect(() => a.getTest).toThrowError(new ShouldBeMockedDependencyError('alicE', 'getTest', 'get'));
  });

  test('Mock override set, throw error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    let spy;
    ProviderMock.mock(provider, {
      alicE: function (mock) {
        spy = jest.spyOn(mock, 'setTest', 'set').mockReturnValue(undefined);
      },
    });

    const { a } = provider.boB;

    a.setTest = undefined;
    expect(spy).toBeCalledTimes(1);
  });

  test('Forget mock override set, throw error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a } = provider.boB;

    expect(() => {
      a.setTest = undefined;
    }).toThrowError(new ShouldBeMockedDependencyError('alicE', 'setTest', 'set'));
  });
});
