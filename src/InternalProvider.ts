import { Container } from './Container';
import { DependencyError, DependencyMultiError } from './DependencyError';
import { DependencyErrorType, DependencyMultiErrorType, NameSelector } from './types';

export class InternalProvider<E> {
  private readonly container: Container<E>;

  constructor(container: Container<E>) {
    this.container = container;
  }

  get<T>(nameSelector: NameSelector<T, E>) {
    const name = this.container.resolveProperty(nameSelector);
    try {
      return this.container.get(name)?.provide();
    } catch (e) {
      const error = e as DependencyError<any, any>;
      if (error.message === 'Maximum call stack size exceeded' || error.type === DependencyErrorType.Circular)
        throw new DependencyError({ type: DependencyErrorType.Circular, lifetime: name });
      throw e;
    }
  }

  validate(): void {
    const keys = Object.keys(this.container.template);
    const unresolved: DependencyError<any, any>[] = [];

    for (let key of keys) {
      try {
        this.get(key);
      } catch (e: unknown) {
        unresolved.push(e as DependencyError<any, any>);
      }
    }

    if (unresolved.length === 0) return;

    throw new DependencyMultiError(DependencyMultiErrorType.Validation, unresolved);
  }
}
