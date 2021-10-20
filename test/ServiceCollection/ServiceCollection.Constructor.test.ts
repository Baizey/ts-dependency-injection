import { ServiceCollection } from '../../src';
import { CircularProvider, Provider } from '../models';

test('Class', () => {
  const services = new ServiceCollection(Provider);
  expect(Object.keys(services.template).length).toBe(3);
});

test('Created class', () => {
  const services = new ServiceCollection(new Provider());
  expect(Object.keys(services.template).length).toBe(3);
});

test('Concat classes', () => {
  const services = new ServiceCollection({ ...new Provider(), ...new CircularProvider() });
  expect(Object.keys(services.template).length).toBe(5);
});
