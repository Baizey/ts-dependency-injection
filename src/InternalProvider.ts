import { Container } from './Container';
import { DependencyError, DependencyMultiError } from './DependencyError';
import { properties } from './utils';
import { DependencyErrorType, DependencyMultiErrorType, NameSelector } from './types';

export class InternalProvider<E> {
  private _container: Container<E>;

  constructor(container: Container<E>) {
    this._container = container;
  }

  get<T>(nameSelector: NameSelector<T, E> | string) {
    const name = typeof nameSelector === 'string' ? nameSelector : nameSelector(properties(this._container.template));
    try {
      return this._container.get(name)?.provide();
    } catch (e) {
      const error = e as DependencyError<any, any>;
      if (error.message === 'Maximum call stack size exceeded')
        throw new DependencyError({ type: DependencyErrorType.Circular, lifetime: name });
      throw e;
    }
  }

  validate(): void {
    const keys = Object.keys(this._container.template);
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
