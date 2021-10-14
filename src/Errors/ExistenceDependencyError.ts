import { DependencyErrorType } from './types';

export class ExistenceDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Existence;

  constructor(lifetime: string) {
    super(`'${lifetime}' has not been added to dependency container, but it was supposed to, wasn't it?`);
    this.lifetime = lifetime;
  }
}
