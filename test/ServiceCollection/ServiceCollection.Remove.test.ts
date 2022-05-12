import { ServiceCollection, Singleton } from '../../src'
import { Alice, Provider } from '../models'

test('Thing exists', () => {
	const sut = new ServiceCollection<Provider>()
	sut.add(Singleton, Alice, (p) => p.alice)
	
	const actual = sut.remove<Alice>((provider) => provider.alice)
	
	expect(actual).toBeTruthy()
	expect(sut.get((provider) => provider.alice)).toBeUndefined()
})

test('Thing doesnt exists', () => {
	const sut = new ServiceCollection<Provider>()
	
	const actual = sut.remove<Alice>((provider) => provider.alice)
	
	expect(actual).toBeUndefined()
	expect(sut.get((provider) => provider.alice)).toBeUndefined()
})