import { setToastFunction, toast } from './toast-functions'

describe('Toast Functions', () => {
  let mockToastFunction: jest.Mock

  beforeEach(() => {
    mockToastFunction = jest.fn()
    setToastFunction(mockToastFunction)
  })

  afterEach(() => {
    setToastFunction(mockToastFunction)
  })

  it('should be able to call success toast', () => {
    toast.success('Success message')

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Success message',
      type: 'success',
      duration: undefined,
    })
  })

  it('should be able to call success toast with duration', () => {
    toast.success('Success message', 2000)

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Success message',
      type: 'success',
      duration: 2000,
    })
  })

  it('should be able to call error toast', () => {
    toast.error('Error message')

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Error message',
      type: 'error',
      duration: undefined,
    })
  })

  it('should be able to call warning toast', () => {
    toast.warning('Warning message')

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Warning message',
      type: 'warning',
      duration: undefined,
    })
  })

  it('should be able to call show toast with default type', () => {
    toast.show('Default message')

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Default message',
      type: undefined,
      duration: undefined,
    })
  })

  it('should be able to call show toast with custom type', () => {
    toast.show('Custom message', 'error', 3000)

    expect(mockToastFunction).toHaveBeenCalledWith({
      message: 'Custom message',
      type: 'error',
      duration: 3000,
    })
  })

  it('should be able to handle when toast function is not set', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.success('Message')
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call error toast when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.error('Error message')
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call warning toast when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.warning('Warning message')
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call show toast when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.show('Show message')
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call error toast with duration when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.error('Error message', 1000)
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call warning toast with duration when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.warning('Warning message', 1000)
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })

  it('should not call show toast with type and duration when toastFunction is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setToastFunction(null as any)

    expect(() => {
      toast.show('Show message', 'success', 1000)
    }).not.toThrow()

    expect(mockToastFunction).not.toHaveBeenCalled()
  })
})
