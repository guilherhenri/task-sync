import { waitFor } from './wait-for'

describe('waitFor', () => {
  jest.useFakeTimers()

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('resolves when assertions pass immediately', async () => {
    const assertions = jest.fn(() => {})
    const waitForPromise = waitFor(assertions)

    jest.advanceTimersByTime(10)

    await expect(waitForPromise).resolves.toBeUndefined()
    expect(assertions).toHaveBeenCalledTimes(1)
  })

  test('resolves when assertions pass before maxDuration', async () => {
    let pass = false
    const assertions = jest.fn(() => {
      if (pass) return
      throw new Error('Not yet')
    })

    const promise = waitFor(assertions, 100)
    jest.advanceTimersByTime(50)
    pass = true
    jest.advanceTimersByTime(10)
    await expect(promise).resolves.toBeUndefined()
    expect(assertions).toHaveBeenCalledTimes(6)
  })

  test('rejects when assertions fail after maxDuration', async () => {
    const assertions = jest.fn(() => {
      throw new Error('Never passes')
    })

    const promise = waitFor(assertions, 100)
    jest.advanceTimersByTime(110)
    await expect(promise).rejects.toThrow('Never passes')
    expect(assertions).toHaveBeenCalledTimes(11)
  })
})
