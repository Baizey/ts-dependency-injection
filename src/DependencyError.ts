import { DependencyErrorType, DependencyMultiErrorType } from './types';

type ErrorProp<T, E> = {
  type: DependencyErrorType;
  lifetime: string;
};

export class DependencyError<T, E> extends Error {
  readonly type: DependencyErrorType;
  readonly lifetime: string;

  constructor({ type, lifetime }: ErrorProp<T, E>) {
    const name = lifetime.toLowerCase();
    super(type.toString().replace('{name}', name));
    this.type = type;
    this.lifetime = name;
  }
}

export class DependencyMultiError<T, E> extends Error {
  constructor(type: DependencyMultiErrorType, errors: DependencyError<any, any>[]) {
    super(type.toString().replace('{errors}', errors.map((e) => e.message).join('\n')));
  }
}
