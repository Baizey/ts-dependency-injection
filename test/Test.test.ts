import { BasicTypesProvider, CircularProvider, Provider, ScopedProvider } from './models';

describe('Verify new instances of provider has expected keys', () => {
  test('Provider', () => {
    expect(Object.keys(new Provider()).sort()).toEqual(['alicE', 'boB', 'totalWhackYo'].sort());
  });
  test('CircularProvider', () => {
    expect(Object.keys(new CircularProvider()).sort()).toEqual(['CircularA', 'CircularB'].sort());
  });
  test('BasicTypesProvider', () => {
    expect(Object.keys(new BasicTypesProvider()).sort()).toEqual(['a', 'b', 'c'].sort());
  });
  test('ScopedProvider', () => {
    expect(Object.keys(new ScopedProvider()).sort()).toEqual(['a', 'b', 'c'].sort());
  });
});
