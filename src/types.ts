export type Stateful<P, T> = {
  create(props: P): T
}