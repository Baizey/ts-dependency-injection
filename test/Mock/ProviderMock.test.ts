import { ProviderMock, ServiceCollection } from '../../src';
import { Alice, BasicTypesProvider, Bob, Dummy, Provider, ScopedA, ScopedB, ScopedC, ScopedProvider } from '../models';
import { ShouldBeMockedDependencyError } from '../../src/Errors/ShouldBeMockedDependencyError';

describe('mock', () => {
  test('mock alice when being provided to bob', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    ProviderMock.mock(provider, {
      alicE: (mock) => jest.spyOn(mock, 'getName').mockReturnValue('Bob'),
    });

    const { a } = provider.boB;

    expect(a.getName()).toBe('Bob');
  });

  test('dont mock alice when being provided to bob and get error', () => {
    const services = new ServiceCollection(Provider);
    services.addTransient({ dependency: Alice, selector: (p) => p.alicE });
    services.addTransient({ dependency: Bob, selector: (p) => p.boB });
    services.addTransient({ dependency: Dummy, selector: (p) => p.totalWhackYo });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a } = provider.boB;

    expect(() => a.getName()).toThrowError(new ShouldBeMockedDependencyError('alicE', 'getName'));
  });

  test('dont mock alice when being provided to bob and get error', () => {
    const services = new ServiceCollection(BasicTypesProvider);
    services.addTransient({ factory: () => '', selector: (p) => p.a });
    services.addTransient({ factory: () => [1], selector: (p) => p.b });
    services.addTransient({ factory: () => [{ a: 1 }], selector: (p) => p.c });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a, b, c } = provider;

    expect(true).toBeTruthy();
  });

  test('Deep mocking', () => {
    const services = new ServiceCollection(ScopedProvider);
    services.addTransient({ dependency: ScopedA, selector: (p) => p.a });
    services.addTransient({ dependency: ScopedB, selector: (p) => p.b });
    services.addTransient({ dependency: ScopedC, selector: (p) => p.c });
    const provider = services.build();

    ProviderMock.mock(provider);

    const { a, b, c } = provider;

    expect(true).toBeTruthy();
  });
});
