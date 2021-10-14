import { DependencyErrorType } from './types';

export class DuplicateDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Duplicate;

  constructor(lifetime: string) {
    super(
      `'${lifetime}' has already been added to dependency container, use tryAdd if you might be adding it in multiple places`,
    );
    this.lifetime = lifetime;
  }
}
