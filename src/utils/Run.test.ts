import Run from './Run'
import Pg from '../../__mocks__/Pg'
describe('Run', () => {
  it('should run a query', async () => {
    const run = Run(Pg())
    const result = await run('SELECT 1', [], true)
    expect(result).toEqual({ id: 1, name: 'test' })
  })
})
