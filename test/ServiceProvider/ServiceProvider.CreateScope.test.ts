import 'jest';
import { ServiceCollection } from '../../src';
import { Provider } from '../models';
import { ProviderValidation } from '../../src/types';

test('Succeed', () => {
  const services = new ServiceCollection(Provider);
  const old = services.build();

  old._.scope = { cake: 'cake' };
  old._.validation.trail['cake'] = true;
  old._.validation.lastSingleton = 'singleton';
  const expectedScope = old._.scope;
  const expectedValidation: ProviderValidation = {
    trail: {},
  };

  const {
    _: { scope: actualScope, validation: actualValidation },
  } = old.createScoped();

  expect(actualScope).toBe(expectedScope);
  expect(actualValidation).toEqual(expectedValidation);
});
