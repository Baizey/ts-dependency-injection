import { ServiceCollection } from './ServiceCollection'

export * from './ServiceCollection'
export * from './ServiceProvider'
export * from './Lifetime'
export * from './Errors'
export { propertyOf, ServiceCollectionOf, ServiceProviderOf } from './utils'
export const Services = () => new ServiceCollection()