import 'jest';
import { Container, DependencyError } from '../src';
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from './models';
import { DependencyMultiError } from '../src';
import { properties } from '../src/utils';
import { DependencyErrorType, DependencyMultiErrorType } from '../src/types';

describe('Get', () => {
  test('Succeed, via get property', () => {
    const container = new Container(Provider);
    const expectedAlice = new Alice();
    container.addSingleton(Alice, { factory: () => expectedAlice });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.alicE;

    expect(alice).toBe(expectedAlice);
  });
  test('Succeed, via classname', () => {
    const container = new Container(Provider);
    const expectedAlice = new Alice();
    container.addSingleton(Alice, { factory: () => expectedAlice });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.get((provider) => provider.alicE);

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
        lifetime: properties(new CircularProvider()).CircularB,
      }),
    );
  });
});

describe('Validate', () => {
  test('Succeed', () => {
    const container = new Container(Provider);
    container.addSingleton(Alice);
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { selector: (provider) => provider.totalWhackYo });
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
        new DependencyError({
          type: DependencyErrorType.Circular,
          lifetime: properties(new CircularProvider()).CircularB,
        }),
        new DependencyError({
          type: DependencyErrorType.Circular,
          lifetime: properties(new CircularProvider()).CircularA,
        }),
      ]),
    );
  });
});
