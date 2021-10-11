import { Keys } from './utils';
import { InternalProvider } from './InternalProvider';

export type ActualProvider<E> = E & InternalProvider<E>;

export type DependencyProvider<T, E> =
  | { prototype: T; name: string; new (provider: E): T }
  | { prototype: T; name: string; new (): T };

export type NameSelector<T, E> = string | ((provider: Keys<T, E>) => string);

export enum DependencyErrorType {
  Existence = `'{name}' has not been added to dependency container, but it was supposed to, wasn't it?`,
  Circular = `'{name}' has circular dependency, two dependencies cannot depend on each other no matter how long the chain is between them`,
  Duplicate = `'{name}' has already been added to dependency container, use tryAdd if you might be adding it in multiple places`,
  Unknown = `'{name}' has not been included as key in the provider, if classname differ from provider name remember to select it via name in the options parameter`,
}

export enum DependencyMultiErrorType {
  Build = `Found errors while building provider\n{errors}`,
  Validation = 'Provider validation failed with\n{errors}',
}
