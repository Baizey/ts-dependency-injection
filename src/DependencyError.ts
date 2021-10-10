import { DependencyGetter } from './Container';

export enum DependencyErrorType {
  Existence = `'{name}' has not been added to dependency container, but it was supposed to, wasn't it?`,
  Circular = `'{name}' has circular dependency, two dependencies cannot depend on each other no matter how long the chain is between them`,
  Duplicate = `'{name}' has already been added to dependency container, use tryAdd if you might be adding it in multiple places`,
  Unknown = `'{name}' has not been included as key in the provider, if classname differ from provider name remember to select it via name in the options parameter`,
}

type ErrorProp<T, E> = {
  type: DependencyErrorType;
  lifetime: DependencyGetter<T, E>;
};

export class DependencyError<T, E> extends Error {
  readonly type: DependencyErrorType;
  readonly lifetime: string;

  constructor({ type, lifetime }: ErrorProp<T, E>) {
    const name = (typeof lifetime === 'string' ? lifetime : lifetime.name).toLowerCase();
    super(type.toString().replace('{name}', name));
    this.type = type;
    this.lifetime = name;
  }
}

export enum DependencyMultiErrorType {
  Build = `Found errors while building provider\n{errors}`,
  Validation = 'Provider validation failed with\n{errors}',
}

export class DependencyMultiError<T, E> extends Error {
  constructor(type: DependencyMultiErrorType, errors: DependencyError<any, any>[]) {
    super(type.toString().replace('{errors}', errors.map((e) => e.message).join('\n')));
  }
}
