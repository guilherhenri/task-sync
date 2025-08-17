import { type Either, left, right } from './either'

function doSomething(shouldSuccess: boolean): Either<string, string> {
  if (shouldSuccess) return right('success')

  return left('error')
}

test('success result', () => {
  const result = doSomething(true)

  expect(result.isRight()).toBeTruthy()
  expect(result.isLeft()).toBeFalsy()
})

test('error result', () => {
  const result = doSomething(false)

  expect(result.isLeft()).toBe(true)
  expect(result.isRight()).toBeFalsy()
})
