import { DependencyErrorType } from './types';

export class MultiDependencyError extends Error {
  readonly type: DependencyErrorType = DependencyErrorType.MultiError;
  readonly errors: Error[];

  constructor(errors: Error[]) {
    super(`Multiple dependency errors were detected:\n${errors.map((e) => e.message).join('\n')}`);
    this.errors = errors;
  }
}
