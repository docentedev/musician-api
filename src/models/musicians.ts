import { initQueryBuilder, IMutation, Utils } from '../utils/QueryBuilderV2'
import Run from '../utils/Run'

type GetAllPaginateProps = {
    page: number
    size: number
    order: string
    sort: 'asc' | 'desc'
}

const musicians = (pg: pg.Pg) => {
  const fields = ['first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_name', 'city_fk', 'alias', 'description']
  const qb = initQueryBuilder({
    table: 'musician',
    as: ['country as co', 'city as c', 'musician as m'],
    fields: ['id', 'first_name', 'last_name', 'country.name', 'city.name'],
    mutationFields: ['id', 'first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_date', 'city_fk', 'alias', 'city_name', 'country_name'],
    select: 'm.id, m.first_name, m.last_name, m.second_last_name, m.second_name, m.birth_date, m.death_date, m.city_fk, m.alias, c.name as city_name, co.nicename as country_name, image, description',
    run: Run(pg)
  })
  const qbMutation = initQueryBuilder({
    table: 'musician',
    fields: ['id', 'first_name', 'last_name', 'country.name', 'city.name'],
    mutationFields: ['id', 'first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_date', 'city_fk', 'alias', 'city_name', 'country_name', 'image', 'description'],
    run: Run(pg)
  })
  const getAllPaginate = async ({ page = 1, size = 10, sort = 'desc', order = 'id' }: GetAllPaginateProps) => {
    try {
      const result = await qb()
        .select()
        .innerJoin({ join: 'city.id', on: 'm.city_fk' })
        .innerJoin({ join: 'country.iso', on: 'c.country_iso_fk' })
        .orderBy(order, sort)
        .paginate(page, size)
        .run()
      const count: any = await qb().count().run()
      return {
        count: Number(count.count),
        rows: result
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  const getBy = async (key: string, value: any) => {
    const result = qb().selectOne().innerJoin({ join: 'city.id', on: 'm.city_fk' }).innerJoin({ join: 'country.iso', on: 'c.country_iso_fk' }).where(key, value)
    return await result.run()
  }

  const insert = async (musician: any) => {
    const data = Utils.getAllowedField(fields, musician)
    const result = await qbMutation().insert(data).run()
    return result
  }

  const update = async (id: any, musician: any) => {
    const data = Utils.getAllowedField(fields, musician)
    const result = await qbMutation().update(data).where('id', id).run()
    return result
  }

  const updateImage = async (id: any, fileName: string) => {
    const data = Utils.getAllowedField(['image'], { image: fileName })
    await qbMutation().update(data).where('id', id).run()
    const result = await getBy('id', id)
    return result
  }

  const deleteById = async (id: any) => {
    const result = await qbMutation().delete().where('id', id).run()
    return result
  }

  return {
    getAllPaginate,
    getBy,
    insert,
    update,
    deleteById,
    updateImage
  }
}

export default musicians
