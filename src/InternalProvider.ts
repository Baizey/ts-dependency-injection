import { Container } from './Container';
import { DependencyError, DependencyMultiError } from './DependencyError';
import { properties } from './utils';
import { DependencyErrorType, DependencyMultiErrorType, NameSelector } from './types';

export class InternalProvider<E> {
  private _container: Container<E>;

  constructor(container: Container<E>) {
    this._container = container;
  }

  get<T>(nameSelector: NameSelector<T, E>) {
    const name = nameSelector(properties(this._container.template));
    try {
      return this.getByString(name);
    } catch (e) {
      const error = e as DependencyError<any, any>;
      if (error.type === DependencyErrorType.Circular)
        throw new DependencyError({ type: DependencyErrorType.Circular, lifetime: name });
      throw e;
    }
  }

  protected getByString<T>(name: string) {
    try {
      const result = this._container.get<T>(name);
      if (result) return result.provide();
    } catch (e) {
      const error = e as Error;
      if (error.message === 'Maximum call stack size exceeded')
        throw new DependencyError({ type: DependencyErrorType.Circular, lifetime: name });
      throw e;
    }

    throw new DependencyError({ type: DependencyErrorType.Existence, lifetime: name });
  }

  validate(): void {
    const keys = Object.keys(this._container.template);
    const unresolved: DependencyError<any, any>[] = [];

    for (let key of keys) {
      try {
        this.getByString(key);
      } catch (e: unknown) {
        unresolved.push(e as DependencyError<any, any>);
      }
    }

    if (unresolved.length === 0) return;

    throw new DependencyMultiError(DependencyMultiErrorType.Validation, unresolved);
  }
}
