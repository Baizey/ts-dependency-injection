import { DependencyErrorType } from './types';
import { Key } from '../ServiceCollection/IServiceCollection';

export class CircularDependencyError extends Error {
  readonly lifetime: string;
  readonly type: DependencyErrorType = DependencyErrorType.Circular;
  readonly layer: Key<any>[];

  constructor(lifetime: Key<any>, layer: Key<any>[]) {
    super(
      `'${lifetime.toString()}' has circular dependency in the chain: '${layer
        .map((e) => e.toString())
        .join(' > ')}'. Two dependencies cannot depend on each other no matter how long the chain is between them`,
    );
    this.lifetime = lifetime.toString();
    this.layer = layer;
  }
}
