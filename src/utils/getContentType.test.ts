import getContentType from './getContentType'

describe('getContentType', () => {
  it('should return the correct content type', () => {
    expect(getContentType('test.jpg')).toBe('image/jpeg')
    expect(getContentType('test.png')).toBe('image/png')
    expect(getContentType('test.gif')).toBe('image/gif')
    expect(getContentType('test.pdf')).toBe('application/pdf')
    expect(getContentType('test.doc')).toBe('application/msword')
    expect(getContentType('test.other')).toBe('application/octet-stream')
  })
})
