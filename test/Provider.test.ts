import 'jest';
import { Container, DependencyError, DependencyErrorType } from '../src';
import { Alice, Bob, Dummy, Provider, CircularA, CircularB, CircularProvider } from './models';
import { DependencyMultiError, DependencyMultiErrorType } from '../src/DependencyError';

describe('Get', () => {
  test('Succeed, via get property', () => {
    const container = new Container(Provider);
    const expectedAlice = new Alice();
    container.addSingleton(Alice, { factory: () => expectedAlice });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.alicE;

    expect(alice).toBe(expectedAlice);
  });
  test('Succeed, via classname', () => {
    const container = new Container(Provider);
    const expectedAlice = new Alice();
    container.addSingleton(Alice, { factory: () => expectedAlice });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    const sut = container.build();

    // @ts-ignore
    const alice = sut[Alice.name];

    expect(alice).toBe(expectedAlice);
  });
  test('Error, circular dependency', () => {
    const container = new Container(CircularProvider);
    container.addSingleton(CircularA);
    container.addSingleton(CircularB);
    const sut = container.build();
    expect(() => sut.CircularA).toThrowError(
      new DependencyError({
        type: DependencyErrorType.Circular,
        lifetime: CircularA,
      }),
    );
  });
});

describe('Validate', () => {
  test('Succeed', () => {
    const container = new Container(Provider);
    container.addSingleton(Alice);
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    const sut = container.build();

    sut.validate();

    expect(true).toBeTruthy();
  });
  test('Error, circular dependency', () => {
    const container = new Container(CircularProvider);
    container.addSingleton(CircularA);
    container.addSingleton(CircularB);
    const sut = container.build();

    expect(() => sut.validate()).toThrowError(
      new DependencyMultiError(DependencyMultiErrorType.Validation, [
        new DependencyError({ type: DependencyErrorType.Circular, lifetime: CircularA }),
        new DependencyError({ type: DependencyErrorType.Circular, lifetime: CircularB }),
      ]),
    );
  });
});