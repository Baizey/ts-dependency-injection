import { DependencyErrorType } from './types';
import { Key } from '../tst/IServiceCollection';

export class DuplicateDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Duplicate;

  constructor(lifetime: Key<any>) {
    super(
      `'${lifetime.toString()}' has already been added to dependency collection, use tryAdd if you might be adding it in multiple places`,
    );
    this.lifetime = lifetime.toString();
  }
}
