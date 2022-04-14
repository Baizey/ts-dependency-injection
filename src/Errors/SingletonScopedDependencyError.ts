import { DependencyErrorType } from './types';
import { Key } from '../ServiceCollection/IServiceCollection';

export class SingletonScopedDependencyError extends Error {
  readonly lifetime: string;
  readonly cause: string;
  readonly type: DependencyErrorType = DependencyErrorType.SingletonScoped;

  constructor(lifetime: Key<any>, cause: Key<any>) {
    super(
      `Singleton '${lifetime.toString()}' depends on scoped '${cause.toString()}', it is not allowed to as it would lock the scoped service into a singleton`,
    );
    this.lifetime = lifetime.toString();
    this.cause = cause.toString();
  }
}
