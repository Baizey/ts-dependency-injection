type WantedKeys<T, E> = { [K in keyof E]: E[K] extends T ? K : never }[keyof E];

export type Keys<T, E> = { [K in WantedKeys<T, E>]: `${K & string}` };

export function properties<T, E>(provider: E): Keys<T, E> {
  return Object.keys(provider).reduce((a, b) => {
    a[b] = b;
    return a;
  }, {} as Record<string, string>) as Keys<T, E>;
}
