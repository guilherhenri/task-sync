import { Entity } from './entity'
import { UniqueEntityID } from './unique-entity-id'

class TestOne extends Entity<null> {
  constructor(props: null, id?: UniqueEntityID) {
    super(props, id ?? undefined)
  }
}

describe('Entity', () => {
  it('should correctly identify when an entity is compared to itself', () => {
    const entityOne = new TestOne(null)

    expect(entityOne.equals(entityOne)).toBeTruthy()
  })

  it('should confirm that two entities with the same ID are equal', () => {
    const entityOne = new TestOne(null, new UniqueEntityID('entity'))
    const entityTwo = new TestOne(null, new UniqueEntityID('entity'))

    expect(entityOne.equals(entityTwo)).toBeTruthy()
  })

  it('should determine that two entities with different IDs are not equal', () => {
    const entityOne = new TestOne(null, new UniqueEntityID('entity-1'))
    const entityTwo = new TestOne(null, new UniqueEntityID('entity-2'))

    expect(entityOne.equals(entityTwo)).toBeFalsy()
  })
})
