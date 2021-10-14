export enum DependencyErrorType {
  SingletonScoped,
  Circular,
  Existence,
  Duplicate,
  Unknown,
  MultiError,
}

export type ErrorTypes =
  | {
      type: DependencyErrorType.Unknown | DependencyErrorType.Existence | DependencyErrorType.Duplicate;
      lifetime: string;
      message: string;
      cause: undefined;
    }
  | {
      type: DependencyErrorType.Circular | DependencyErrorType.SingletonScoped;
      lifetime: string;
      cause: string;
      message: string;
    }
  | {
      type: DependencyErrorType.MultiError;
      errors: (ErrorTypes | Error)[];
      message: string;
    };
