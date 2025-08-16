import { AggregateRoot } from '../entities/aggregate-root'
import type { UniqueEntityID } from '../entities/unique-entity-id'
import type { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregateCreated implements DomainEvent {
  private aggregate: CustomAggregate
  public ocurredAt: Date

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class AnotherCustomEvent implements DomainEvent {
  private aggregate: CustomAggregate
  public ocurredAt: Date

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

    return aggregate
  }

  static createWithMultipleEvents() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))
    aggregate.addDomainEvent(new AnotherCustomEvent(aggregate))

    return aggregate
  }
}

describe('Domain Events', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()
  })

  it('should dispatch and listen to events', () => {
    const callbackSpy = jest.fn()

    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    const aggregate = CustomAggregate.create()
    expect(aggregate.domainEvents).toHaveLength(1)

    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    expect(callbackSpy).toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(0)
  })

  it('should not dispatch events when shouldRun is false', () => {
    const callbackSpy = jest.fn()

    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    const aggregate = CustomAggregate.create()
    DomainEvents.shouldRun = false

    DomainEvents.dispatchEventsForAggregate(aggregate.id)
    expect(callbackSpy).not.toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(0)

    DomainEvents.shouldRun = true
  })

  it('should restrict event dispatching to allowed events', () => {
    const callbackSpy1 = jest.fn()
    const callbackSpy2 = jest.fn()

    DomainEvents.register(callbackSpy1, CustomAggregateCreated.name)
    DomainEvents.register(callbackSpy2, AnotherCustomEvent.name)
    DomainEvents.restrictToEvents([CustomAggregateCreated.name])

    const aggregate = CustomAggregate.createWithMultipleEvents()

    DomainEvents.dispatchEventsForAggregate(aggregate.id)
    expect(callbackSpy1).toHaveBeenCalled()
    expect(callbackSpy2).not.toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(0)
  })

  it('should clear marked aggregates', () => {
    const aggregate = CustomAggregate.create()

    DomainEvents.markAggregateForDispatch(aggregate)
    DomainEvents.clearMarkedAggregates()
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    expect(aggregate.domainEvents).toHaveLength(1)
  })

  it('should register multiple callbacks for the same event type', () => {
    const callbackSpy1 = jest.fn()
    const callbackSpy2 = jest.fn()

    DomainEvents.register(callbackSpy1, CustomAggregateCreated.name)
    DomainEvents.register(callbackSpy2, CustomAggregateCreated.name)

    const aggregate = CustomAggregate.create()
    DomainEvents.markAggregateForDispatch(aggregate)
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    expect(callbackSpy1).toHaveBeenCalledTimes(1)
    expect(callbackSpy2).toHaveBeenCalledTimes(1)
    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
