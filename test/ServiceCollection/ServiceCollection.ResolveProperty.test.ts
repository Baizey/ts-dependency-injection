import { ExistenceDependencyError, ServiceCollection } from '../../src'
import { Provider } from '../models'

test('Forgetting property', () => {
	const services = new ServiceCollection<Provider>().build()
	
	expect(() => services.proxy.alice).toThrowError(new ExistenceDependencyError('alice'))
})