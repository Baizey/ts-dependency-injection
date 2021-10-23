import { DependencyErrorType } from './types';

export class ShouldBeMockedDependencyError extends Error {
  readonly lifetime: string;
  readonly property: string;
  readonly type: DependencyErrorType = DependencyErrorType.ShouldBeMocked;

  constructor(lifetime: string, property: string) {
    super(`${lifetime}.${property} was called in a mocked provider, you need to provide a mock for it`);
    this.lifetime = lifetime;
    this.property = property;
  }
}