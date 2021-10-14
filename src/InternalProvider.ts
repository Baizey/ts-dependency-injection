import { Container } from './Container';
import { ActualProvider, NameSelector, ProviderContext, ProviderCreator, ProviderValidation } from './types';
import { CircularDependencyError, DependencyErrorType, ErrorTypes, MultiDependencyError } from './Errors';

export class InternalProvider<E> {
  readonly _: {
    container: Container<E>;
    create: ProviderCreator<E>;
    validation: ProviderValidation<E>;
    context: ProviderContext<E>;
  };

  constructor(
    container: Container<E>,
    create: ProviderCreator<E>,
    validation: ProviderValidation<E>,
    context: ProviderContext<E>,
  ) {
    this._ = {
      context,
      validation,
      container,
      create,
    };
  }

  get<T>(nameSelector: NameSelector<T, E>) {
    const { container, context, create, validation } = this._;
    const name = container.resolveProperty(nameSelector);

    try {
      const actual = context ? (this as unknown as ActualProvider<E>) : create(validation, {});
      return container.get(name)?.provide(actual);
    } catch (e) {
      const error = e as ErrorTypes;
      switch (error.type) {
        case DependencyErrorType.Circular:
          // When error is detected we can only say lifetime === cause
          // Letting it throw 1 dependency up we can find the dependencies causing the issue
          if (error.lifetime !== error.cause) throw e;
          throw new CircularDependencyError(error.lifetime, name);
        default:
          throw e;
      }
    }
  }

  validate(): void {
    const {
      container: { template },
    } = this._;
    const keys = Object.keys(template);
    const unresolved: Error[] = [];

    for (let key of keys) {
      try {
        this.get(key);
      } catch (e: unknown) {
        unresolved.push(e as Error);
      }
    }

    if (unresolved.length === 0) return;

    throw new MultiDependencyError(unresolved);
  }
}
