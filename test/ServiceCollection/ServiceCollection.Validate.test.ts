import { Scoped, ServiceCollection, Singleton } from '../../src';
import {
  Alice,
  Bob,
  CircularA,
  CircularB,
  CircularProvider,
  Dummy,
  Provider,
  ScopedA,
  ScopedB,
  ScopedC,
  ScopedProvider,
} from '../models';
import { MultiDependencyError } from '../../src/Errors/MultiDependencyError';
import { CircularDependencyError } from '../../src/Errors/CircularDependencyError';
import { SingletonScopedDependencyError } from '../../src/Errors/SingletonScopedDependencyError';
import { ExistenceDependencyError } from '../../src/Errors/ExistenceDependencyError';

test('Succeed', () => {
  const services = new ServiceCollection(Provider);
  services.add(Singleton, Alice);
  services.add(Singleton, Bob);
  services.add(Singleton, { dependency: Dummy, selector: (provider) => provider.totalWhackYo });

  services.validate();

  expect(true).toBeTruthy();
});

test('Error, circular dependency', () => {
  const services = new ServiceCollection(CircularProvider);
  services.add(Singleton, CircularA);
  services.add(Singleton, CircularB);

  expect(() => services.validate()).toThrowError(
    new MultiDependencyError([
      new CircularDependencyError('CircularA', 'CircularB'),
      new CircularDependencyError('CircularB', 'CircularA'),
    ]),
  );
});

test('Error, Scoped-Singleton dependency', () => {
  const services = new ServiceCollection(ScopedProvider);
  services.add(Scoped, { dependency: ScopedA, selector: (p) => p.a });
  services.add(Scoped, { dependency: ScopedB, selector: (p) => p.b });
  services.add(Singleton, { dependency: ScopedC, selector: (p) => p.c });

  expect(() => services.validate()).toThrowError(
    new MultiDependencyError([new SingletonScopedDependencyError('c', 'b')]),
  );
});

test('Error, Scoped-Singleton dependency', () => {
  const services = new ServiceCollection(ScopedProvider);
  expect(() => services.validate()).toThrowError(
    new MultiDependencyError([
      new ExistenceDependencyError('a'),
      new ExistenceDependencyError('b'),
      new ExistenceDependencyError('c'),
    ]),
  );
});
