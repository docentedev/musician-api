import { initQueryBuilder } from '../utils/QueryBuilderV2'
import Run from '../utils/Run'

type GetAllPaginateProps = {
    page: number
    size: number
    order: string
    sort: 'asc' | 'desc'
}

const cities = (pg: pg.Pg) => {
  const qb = initQueryBuilder({
    table: 'city',
    as: ['country as co', 'city as c'],
    fields: ['id', 'name', 'admin_name'],
    select: 'c.id, c.name, c.admin_name',
    run: Run(pg)
  })
  const getAllPaginate = async ({ page = 1, size = 10, sort = 'desc', order = 'id' }: GetAllPaginateProps) => {
    const result = qb().select().orderBy(order, sort).paginate(page, size)
    const count = await qb().count().run()
    return {
      count: Number(count.count),
      rows: await result.run()
    }
  }
  const getBy = async (key: string, value: any) => {
    const result = await qb().selectOne().where([key], value).run()
    return result
  }

  const search = async (value: any) => {
    const query = qb()
      .select('c.id, c.name, c.admin_name, co.nicename as country_name')
      .innerJoin({ join: 'country.iso', on: 'c.country_iso_fk' })
      .where(['c.name', 'c.admin_name'], value, 'ILIKE')
    const result = await query.run()
    return result
  }

  return {
    getAllPaginate,
    getBy,
    search
  }
}

export default cities
