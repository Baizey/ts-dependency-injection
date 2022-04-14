import { DependencyErrorType } from './types';
import { Key } from '../ServiceCollection/IServiceCollection';

export class ExistenceDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Existence;

  constructor(lifetime: Key<any>) {
    super(`'${lifetime.toString()}' has not been added to dependency collection, but it was supposed to, wasn't it?`);
    this.lifetime = lifetime.toString();
  }
}
