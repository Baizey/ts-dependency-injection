import 'jest';
import { ServiceCollection, Singleton } from '../src';
import { Alice, Bob, CircularA, CircularB, CircularProvider, Dummy, Provider } from './models';
import { CircularDependencyError, MultiDependencyError } from '../src/Errors';

describe('Get', () => {
  test('Succeed, via get property', () => {
    const container = new ServiceCollection(Provider);
    const expectedAlice = new Alice();
    container.add(Singleton, { dependency: Alice, factory: () => expectedAlice });
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.alicE;

    expect(alice).toBe(expectedAlice);
  });
  test('Succeed, via classname', () => {
    const container = new ServiceCollection(Provider);
    const expectedAlice = new Alice();
    container.add(Singleton, { dependency: Alice, factory: () => expectedAlice });
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });
    const sut = container.build();

    const alice = sut.getService((provider) => provider.alicE);

    expect(alice).toBe(expectedAlice);
  });
  test('Error, circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Singleton, CircularA);
    container.add(Singleton, CircularB);
    const sut = container.build(true);
    expect(() => sut.CircularA).toThrowError(new CircularDependencyError('CircularA', 'CircularB'));
  });
});

describe('Validate', () => {
  test('Succeed', () => {
    const container = new ServiceCollection(Provider);
    container.add(Singleton, Alice);
    container.add(Singleton, Bob);
    container.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

    container.validate();

    expect(true).toBeTruthy();
  });
  test('Error, circular dependency', () => {
    const container = new ServiceCollection(CircularProvider);
    container.add(Singleton, CircularA);
    container.add(Singleton, CircularB);

    expect(() => container.validate()).toThrowError(
      new MultiDependencyError([
        new CircularDependencyError('CircularA', 'CircularB'),
        new CircularDependencyError('CircularB', 'CircularA'),
      ]),
    );
  });
});
