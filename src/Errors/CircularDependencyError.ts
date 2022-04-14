import { DependencyErrorType } from './types';
import { Key } from '../tst/IServiceCollection';

export class CircularDependencyError extends Error {
  readonly lifetime: string;
  readonly cause: string;
  readonly type: DependencyErrorType = DependencyErrorType.Circular;

  constructor(lifetime: Key<any>, cause: Key<any>) {
    super(
      `'${lifetime.toString()}' and '${cause.toString()}' has circular dependency, two dependencies cannot depend on each other no matter how long the chain is between them`,
    );
    this.lifetime = lifetime.toString();
    this.cause = cause.toString();
  }
}
