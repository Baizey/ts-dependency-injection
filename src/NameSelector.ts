export type Keys<T> = { [K in keyof T]: `${K & string}` };

export function nameSelector<E>(provider: E): Keys<E> {
  return Object.keys(provider).reduce((a, b) => {
    a[b] = b;
    return a;
  }, {} as Record<string, string>) as Keys<E>;
}