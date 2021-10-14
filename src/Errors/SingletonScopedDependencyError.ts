import { DependencyErrorType } from './types';

export class SingletonScopedDependencyError extends Error {
  readonly lifetime: string;
  readonly cause: string;
  readonly type: DependencyErrorType = DependencyErrorType.SingletonScoped;

  constructor(lifetime: string, cause: string) {
    super(
      `Singleton '${lifetime}' depends on scoped '${cause}', it is not allowed to as it would lock the scoped service into a singleton`,
    );
    this.lifetime = lifetime;
    this.cause = cause;
  }
}
