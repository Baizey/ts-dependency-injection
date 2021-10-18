import { ServiceCollection } from '../../src';
import { Provider } from '../models';
import { UnknownDependencyError } from '../../src/Errors/UnknownDependencyError';

test('Forgetting property', () => {
  const services = new ServiceCollection(Provider);

  expect(() => services.resolveProperty()).toThrowError(new UnknownDependencyError('<missing arguments>'));
});
