import { DependencyErrorType } from './types';

export class UnknownDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Unknown;

  constructor(lifetime: string) {
    super(
      `'${lifetime}' has not been included as key in the provider, if classname differ from provider name remember to select it via name in the options parameter`,
    );
    this.lifetime = lifetime;
  }
}
