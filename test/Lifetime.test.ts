import 'jest';
import { Container } from '../src';
import { Alice, Bob, Dummy, Provider } from './models';

describe('Provide', () => {
  test('Singleton', () => {
    const container = new Container(Provider);
    container.addSingleton(Alice, { factory: () => new Alice() });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    const sut = container.get(Alice);

    const a = sut?.provide();
    const b = sut?.provide();

    expect(a).not.toBeUndefined();
    expect(b).not.toBeUndefined();
    expect(a).toBe(b);
  });
  test('Transient', () => {
    const container = new Container(Provider);
    container.addTransient(Alice, { factory: () => new Alice() });
    container.addSingleton(Bob);
    container.addSingleton(Dummy, { name: (provider) => provider.totalWhackYo });
    const sut = container.get(Alice);

    const a = sut?.provide();
    const b = sut?.provide();

    expect(a).not.toBeUndefined();
    expect(b).not.toBeUndefined();
    expect(a).not.toBe(b);
  });
});