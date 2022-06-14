import musicians from './musicians'
import Pg from '../../__mocks__/Pg'
describe('Musicians', () => {
  it('getBy', async () => {
    const pg = Pg({ rows: [{ id: 2, name: 'test' }] })
    const model = musicians(pg)
    const result = await model.getBy('id', 2)
    expect(result).toEqual({ id: 2, name: 'test' })
  })
  it('getAllPaginate', async () => {
    const pg = Pg({ rows: [{ id: 4, name: 'test' }] })
    const model = musicians(pg)
    const result = await model.getAllPaginate({ page: 1, size: 10, sort: 'asc', order: 'id' })
    expect(result.rows).toEqual([{ id: 4, name: 'test' }])
  })
  it('insert', async () => {
    const pg = Pg({ rows: { id: 5, name: 'test' } })
    const model = musicians(pg)
    const result = await model.insert({ id: 1, first_name: 'test' })
    expect(result).toEqual({ id: 5, name: 'test' })
  })
  it('update', async () => {
    const pg = Pg({ rows: { id: 6, name: 'test' } })
    const model = musicians(pg)
    const result = await model.update(1, { id: 6, first_name: 'test' })
    expect(result).toEqual({ id: 6, name: 'test' })
  })
  it('updateImage', async () => {
    const pg = Pg({ rows: { id: 7, name: 'test' } })
    const model = musicians(pg)
    const result = await model.updateImage(1, 'test.jpg')
    expect(result).toEqual(undefined)
  })
  it('deleteById', async () => {
    const pg = Pg({ rows: { id: 8, name: 'test' } })
    const model = musicians(pg)
    const result = await model.deleteById(1)
    expect(result).toEqual({ id: 8, name: 'test' })
  })
})
