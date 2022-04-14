import { DependencyErrorType } from './types';
import { Key } from '../tst/IServiceCollection';

export class UnknownDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Unknown;

  constructor(lifetime: Key<any>) {
    super(
      `'${lifetime.toString()}' has not been included as key in the provider, if classname differ from provider name remember to select it via name in the options parameter`,
    );
    this.lifetime = lifetime.toString();
  }
}
