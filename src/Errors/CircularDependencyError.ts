import { DependencyErrorType } from './types';

export class CircularDependencyError extends Error {
  readonly lifetime: string;
  readonly cause: string;
  readonly type: DependencyErrorType = DependencyErrorType.Circular;

  constructor(lifetime: string, cause: string) {
    super(
      `'${lifetime}' and '${cause}' has circular dependency, two dependencies cannot depend on each other no matter how long the chain is between them`,
    );
    this.lifetime = lifetime;
    this.cause = cause;
  }
}
