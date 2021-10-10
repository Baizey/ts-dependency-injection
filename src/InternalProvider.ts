import { Container, DependencyGetter } from './Container';
import {
  DependencyError,
  DependencyErrorType,
  DependencyMultiError,
  DependencyMultiErrorType,
} from './DependencyError';

export class InternalProvider<E> {
  private _container: Container<E>;

  constructor(container: Container<E>) {
    this._container = container;
  }

  get<T>(name: DependencyGetter<T, E>) {
    try {
      return this.internalGet<T>(name);
    } catch (e) {
      const error = e as DependencyError<any, any>;
      if (error.type === DependencyErrorType.Circular)
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

  private internalGet<T>(name: DependencyGetter<T, E>) {
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
}
