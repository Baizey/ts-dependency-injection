import { ScopedContext, ServiceCollection, Stateful } from '../../src'

export type StatefulProvider = {
	scoped: StatefulService
	stateful: Stateful<void, StatefulFactory>
	singleton: StatefulService
	transient: StatefulService
	circular: Stateful<void, StatefulCircular>
	provider: ScopedContext<StatefulProvider>
}

export const statefulProvider = (mock?: boolean) => {
	const services = new ServiceCollection<StatefulProvider>()
	services.addScoped(StatefulService, e => e.scoped)
	services.addStateful(StatefulFactory, e => e.stateful)
	services.addSingleton(StatefulService, e => e.singleton)
	services.addTransient(StatefulService, e => e.transient)
	services.addStateful(StatefulCircular, e => e.circular)
	services.addScoped({ factory: (p, c) => c }, 'provider')
	return (mock ? services.buildMock() : services.build()).proxy
}

export class StatefulCircular {
	constructor({ circular }: StatefulProvider) {
		circular.create()
	}
}

export class StatefulFactory {
	readonly scoped: StatefulService
	private stateful: Stateful<void, StatefulFactory>
	
	constructor({ stateful, scoped }: StatefulProvider) {
		this.stateful = stateful
		this.scoped = scoped
	}
}

export class StatefulService {
	readonly stateful: Stateful<void, StatefulFactory>
	
	constructor({ stateful }: StatefulProvider) {
		this.stateful = stateful
	}
}