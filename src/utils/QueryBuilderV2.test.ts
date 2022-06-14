import { initQueryBuilder, IMutation, Utils } from './QueryBuilderV2'

interface Musician extends IMutation {
    id?: string
    first_name: string
    last_name: string
    second_last_name?: string
    second_name?: string
    birth_date?: Date
    death_date?: Date
    city_fk: number
    alias?: string
}

describe('QueryBuilder', () => {
  test('initQueryBuilder', () => {
    const qb = initQueryBuilder({
      table: 'city',
      as: ['country as co', 'city as c'],
      fields: ['id', 'name', 'admin_name'],
      select: 'c.id, c.name, c.admin_name',
      run: async (_sql: string, _values: any[], _single: Boolean) => { }
    })

    const result1 = qb().selectOne().where(['name'], 'Claudio').build()
    expect(result1).toEqual({ text: 'SELECT c.id, c.name, c.admin_name FROM city AS c WHERE c.name = $1', values: ['Claudio'], table: 'city', selectOne: true, fields: [{ table: 'c', field: 'id', tableName: 'city' }, { table: 'c', field: 'name', tableName: 'city' }, { table: 'c', field: 'admin_name', tableName: 'city' }] })

    const result2 = qb().select('').where(['name'], 'Claudio').build()
    expect(result2).toEqual({ text: 'SELECT c.id, c.name, c.admin_name FROM city AS c WHERE c.name = $1', values: ['Claudio'], table: 'city', selectOne: false, fields: [{ table: 'c', field: 'id', tableName: 'city' }, { table: 'c', field: 'name', tableName: 'city' }, { table: 'c', field: 'admin_name', tableName: 'city' }] })

    const result3 = qb().select().innerJoin({ join: 'city.id', on: 'm.city_fk' }).innerJoin({ join: 'country.iso', on: 'c.country_iso_fk' }).orderBy('id', 'asc').paginate(1, 10).build()
    expect(result3).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.id, c.name, c.admin_name FROM city AS c INNER JOIN city AS c ON c.id = m.city_fk INNER JOIN country AS co ON co.iso = c.country_iso_fk ORDER BY c.id asc LIMIT $2  OFFSET (($1 - 1) * $2)', values: [1, 10] })

    const result4 = qb().select('name').where(['city__name'], 'Claudio').build()
    expect(result4).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.name FROM city AS c WHERE c.name = $1', values: ['Claudio'] })

    const result5 = qb().select('*').where(['name'], 'Claudio').build()
    expect(result5).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT * FROM city AS c WHERE c.name = $1', values: ['Claudio'] })

    const result6 = qb().count().build()
    expect(result6).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: true, table: 'city', text: 'SELECT COUNT(*) FROM city AS c', values: [] })

    const result7 = qb().select('name').where({ field: 'city__name' }, 'Claudio').build()
    expect(result7).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.name FROM city AS c WHERE c.name = $1', values: ['Claudio'] })

    const result8 = qb().select('name').where([{ field: 'city__name' }], 'Claudio', 'EQ').build()
    expect(result8).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.name FROM city AS c WHERE c.name EQ $1', values: ['Claudio'] })

    const result9 = qb().select('name').where([{ field: 'city__name', value: 'Claudio' }, { field: 'id', value: 'Claudio' }]).build()
    expect(result9).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.name FROM city AS c WHERE c.name = $1 OR c.id = $2', values: ['Claudio', 'Claudio'] })

    const result10 = qb().select('name').where('city__name', 'Claudio').build()
    expect(result10).toEqual({ fields: [{ field: 'id', table: 'c', tableName: 'city' }, { field: 'name', table: 'c', tableName: 'city' }, { field: 'admin_name', table: 'c', tableName: 'city' }], selectOne: false, table: 'city', text: 'SELECT c.name FROM city AS c WHERE c.name = $1', values: ['Claudio'] })
  })

  test('initQueryBuilder insert', () => {
    const qb = initQueryBuilder({
      table: 'musician',
      fields: ['id', 'first_name', 'last_name', 'country.name', 'city.name'],
      mutationFields: ['id', 'first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_date', 'city_fk', 'alias', 'city_name', 'country_name'],
      run: async (_sql: string, _values: any[], _single: Boolean) => { }
    })
    const musician: Musician = {
      id: '1',
      first_name: 'Claudio',
      last_name: 'Estrada',
      city_fk: 1
    }
    const result = qb().insert(musician).build()
    expect(result).toEqual({
      text: 'INSERT INTO musician (id,first_name,last_name,city_fk) VALUES ($1,$2,$3,$4) RETURNING *',
      values: ['1', 'Claudio', 'Estrada', 1],
      table: 'musician',
      selectOne: false,
      mutateFields: [
        { table: 'musician', field: 'id', tableName: 'musician' },
        { table: 'musician', field: 'first_name', tableName: 'musician' },
        { table: 'musician', field: 'last_name', tableName: 'musician' },
        { table: 'musician', field: 'second_last_name', tableName: 'musician' },
        { table: 'musician', field: 'second_name', tableName: 'musician' },
        { table: 'musician', field: 'birth_date', tableName: 'musician' },
        { table: 'musician', field: 'death_date', tableName: 'musician' },
        { table: 'musician', field: 'city_fk', tableName: 'musician' },
        { table: 'musician', field: 'alias', tableName: 'musician' },
        { table: 'musician', field: 'city_name', tableName: 'musician' },
        { table: 'musician', field: 'country_name', tableName: 'musician' }]
    })
  })

  test('initQueryBuilder update', () => {
    const qb = initQueryBuilder({
      table: 'musician',
      fields: ['id', 'first_name', 'last_name', 'country.name', 'city.name'],
      mutationFields: ['id', 'first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_date', 'city_fk', 'alias', 'city_name', 'country_name'],
      run: async (_sql: string, _values: any[], _single: Boolean) => { }
    })
    const musician: Musician = {
      id: '1',
      first_name: 'Claudio',
      last_name: 'Estrada',
      city_fk: 1
    }
    const result = qb().update(musician).where([{ field: 'id', value: '1' }]).build()
    expect(result).toEqual({
      text: 'UPDATE musician SET id = $1, first_name = $2, last_name = $3, city_fk = $4 WHERE musician.id = $5',
      values: ['1', 'Claudio', 'Estrada', 1, '1'],
      table: 'musician',
      selectOne: false,
      mutateFields: [
        { table: 'musician', field: 'id', tableName: 'musician' },
        { table: 'musician', field: 'first_name', tableName: 'musician' },
        { table: 'musician', field: 'last_name', tableName: 'musician' },
        { table: 'musician', field: 'second_last_name', tableName: 'musician' },
        { table: 'musician', field: 'second_name', tableName: 'musician' },
        { table: 'musician', field: 'birth_date', tableName: 'musician' },
        { table: 'musician', field: 'death_date', tableName: 'musician' },
        { table: 'musician', field: 'city_fk', tableName: 'musician' },
        { table: 'musician', field: 'alias', tableName: 'musician' },
        { table: 'musician', field: 'city_name', tableName: 'musician' },
        { table: 'musician', field: 'country_name', tableName: 'musician' }]
    })
  })

  test('initQueryBuilder delete', () => {
    const qb = initQueryBuilder({
      table: 'musician',
      fields: ['id', 'first_name', 'last_name', 'country.name', 'city.name'],
      run: async (_sql: string, _values: any[], _single: Boolean) => { }
    })
    const result = qb().delete().where([{ field: 'id', value: '1' }]).build()
    expect(result).toEqual({ mutateFields: [], selectOne: false, table: 'musician', text: 'DELETE FROM musician WHERE musician.id = $1 RETURNING *', values: ['1'] })
  })

  test('initQueryBuilder test error', () => {
    const qb = initQueryBuilder({
      table: 'city',
      as: ['country as co', 'city as c'],
      fields: ['id', 'name', 'admin_name'],
      select: 'c.id, c.name, c.admin_name',
      run: async (_sql: string, _values: any[], _single: Boolean) => { }
    })

    try {
      qb().select('*').where(['not_allowed_field'], 'Claudio').build()
    } catch (error: any) {
      expect(error.message).toBe('Field c.not_allowed_field its not allowed')
    }
  })

  test('initQueryBuilder test run and debug', async () => {
    const qb = initQueryBuilder({
      table: 'city',
      as: ['country as co', 'city as c'],
      fields: ['id', 'name', 'admin_name'],
      select: 'c.id, c.name, c.admin_name',
      // debug: true,
      run: async (sql: string, values: any[], single: Boolean) => Promise.resolve({ sql, values, single })
    })

    const result = await qb().select('*').where(['id'], 'Claudio').run()
    expect(result).toStrictEqual({ single: false, sql: 'SELECT * FROM city AS c WHERE c.id = $1', values: ['Claudio'] })
  })

  test('Utils.getAllowedField should return a object with name=Claudio key', () => {
    const result = Utils.getAllowedField(['name'], { name: 'Claudio', last_name: 'Rojas' })
    expect(result).toStrictEqual({ name: 'Claudio' })
  })
})
