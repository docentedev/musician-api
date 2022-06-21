interface QueryBuilderProps {
  table: string
  as?: string[]
  select?: string
  fields: string[]
  run?: (sql: string, values: any[], single: Boolean) => Promise<any>
  debug?: boolean
  mutationFields?: string[]
}

type InnerJoinProps = {
  join: string
  on: string
}

type Mode = 'LIKE' | 'ILIKE' | 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NOTIN' | 'BETWEEN' | 'NOTBETWEEN' | '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'NOT IN'
type SearchItem = {
  field: string
  value?: any
  mode?: Mode
  operator?: 'AND' | 'OR'
}

type OrderProp = 'ASC' | 'DESC' | 'asc' | 'desc'

const modeOpts = ['LIKE', 'ILIKE', 'EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'IN', 'NOTIN', 'BETWEEN', 'NOTBETWEEN', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN']
const operatorOpts = ['AND', 'OR']

export interface IMutation { [field: string]: any }

class QueryBuilder {
  #sqlDelete: boolean = false
  #sqlMutation: boolean = false
  #sqlText: string = ''
  #sqlTable: string = ''
  #sqlSelect: string[] = []
  #sqlAlias: { [key: string]: string } = {}
  // #sqlSelectAlias: { [key: string]: string } = {}
  #sqlFields: { table: string, field: string }[] = []
  #sqlValues: any[] = []
  #sqlOrderDirections = ['ASC', 'DESC']
  #sqlRun?: (sql: string, values: any[], single: Boolean) => Promise<any>
  #debug: boolean = false
  #isSingleResult = false
  #sqlMutateFields: { table: string, field: string }[] = []
  constructor({
    table,
    as = [],
    select = '*',
    fields = [],
    run,
    debug = false,
    mutationFields = []
  }: QueryBuilderProps) {
    this.#sqlTable = table
    this.#sqlAlias = this.#parseAlias(as)
    this.#sqlFields = this.#parseFields(fields)
    this.#sqlMutateFields = this.#parseFields(mutationFields)
    this.#sqlSelect = this.#parseSelect(select)
    this.#debug = debug
    this.#sqlRun = run
  }

  // parse as ['table as alias']
  #parseAlias(as: string[]) {
    const items: { [key: string]: string } = {}
    as.forEach((item) => {
      const aliasArr = item.split(' as ')
      const name = aliasArr[0].trim()
      const alias = aliasArr[1].trim()
      items[name] = alias
    })
    return items
  }

  // this method, return table name or table alias
  #getTable(tableName: string) {
    return this.#sqlAlias[tableName] ?? tableName
  }

  #parseSelect(fields: string) {
    // if fields is void
    if (fields === '*' || fields === '') {
      return ['*']
    }
    // Process fields
    const items: { [key: string]: string } = {}
    const itemJoinTable: string[] = []
    const fieldsArr = fields.split(',')
    fieldsArr.forEach((item) => {
      const aliasArr = item.split(' as ')
      const name = aliasArr[0].trim()
      const alias = (aliasArr[1] || '').trim() ?? ''
      const nameSplit = name.split('.')
      // append table name or alias
      let sqlJoinTable = ''
      if (nameSplit.length === 2) {
        // const parsedField = this.#parseField(nameSplit[0])
        const tableName = this.#getTable(nameSplit[0])
        if (tableName) {
          sqlJoinTable = `${tableName}.${nameSplit[1]}`
        } else {
          const tableName = this.#getTable(this.#sqlTable)
          sqlJoinTable = `${tableName}.${nameSplit[1]}`
        }
      } else {
        const tableName = this.#getTable(this.#sqlTable)
        sqlJoinTable = `${tableName}.${nameSplit[0]}`
      }
      if (alias !== '') {
        sqlJoinTable += ` as ${alias}`
      }
      itemJoinTable.push(sqlJoinTable)
      items[name] = alias
    })
    // this.#sqlSelectAlias = items
    return itemJoinTable
  }

  #from() {
    const isAlias = !!this.#sqlAlias[this.#sqlTable]
    const sqlAs = isAlias ? ` AS ${this.#getTable(this.#sqlTable)}` : ''
    return ` FROM ${this.#sqlTable}${sqlAs}`
  }

  #generateAs(table: string) {
    const isAlias = !!this.#sqlAlias[table]
    const sqlAs = isAlias ? ` AS ${this.#getTable(table)}` : ''
    return ` ${table}${sqlAs}`
  }

  #parseField(field: string) {
    const item: { table: string, field: string, tableName: string } = { table: '', field: '', tableName: '' }
    const isUnderscores = field.includes('__')
    const isDot = field.includes('.')
    const isSingleField = !(isDot || isUnderscores)
    const itemSplit = field.split(isDot ? '.' : '__')
    const tableName = this.#getTable(
      isSingleField ? this.#sqlTable : itemSplit[0]
    )
    item.tableName = isSingleField ? this.#sqlTable : itemSplit[0]
    item.table = tableName
    item.field = itemSplit[isSingleField ? 0 : 1]
    return item
  }

  #parseFields(fields: string[]) {
    const items: { table: string, field: string }[] = []
    fields.forEach((item) => {
      const parsedItem = this.#parseField(item)
      items.push(parsedItem)
    })
    return items
  }

  // return true if this field is valid or generate an Fatal Error
  #checkBaseField(table: string, field: string, allowedFields: { table: string, field: string }[] = []) {
    const findCallback = (i: any) => i.table === table && i.field === field
    const isField = allowedFields.find(findCallback)
    if (!isField) {
      this.#catch(`Field ${table}.${field} its not allowed`)
    }
    return true
  }

  #checkField(table: string, field: string) {
    return this.#checkBaseField(table, field, this.#sqlFields)
  }

  #checkMutationField(table: string, field: string) {
    return this.#checkBaseField(table, field, this.#sqlMutateFields)
  }

  #catch = (message: string) => {
    throw new Error(message)
  }

  // sql public
  select(sqlSelect?: string, selectOne = false) {
    this.#isSingleResult = selectOne
    if (sqlSelect) {
      this.#sqlSelect = this.#parseSelect(sqlSelect)
    }
    this.#sqlValues = []
    const fields = this.#sqlSelect.join(', ')
    this.#sqlText = `SELECT ${fields}${this.#from()}`
    return this
  }

  selectOne(sqlSelect?: string) {
    return this.select(sqlSelect, true)
  }

  paginate(page: number = 1, size: number = 10) {
    this.#sqlValues.push(page)
    this.#sqlValues.push(size)

    const values = this.#sqlValues
    const pageVal = `$${values.length}`
    const sizeVal = `$${values.length - 1}`
    this.#sqlText += ` LIMIT ${pageVal}  OFFSET ((${sizeVal} - 1) * ${pageVal})`
    return this
  }

  innerJoin({ join, on }: InnerJoinProps) {
    const joinParsed = this.#parseField(join)
    const onParsed = this.#parseField(on)
    const tableOn = this.#getTable(onParsed.table)
    const tableJoin = this.#getTable(joinParsed.table)
    const tableJoinAs = this.#generateAs(joinParsed.tableName)
    const fieldOn = onParsed.field
    const fieldJoin = joinParsed.field
    const sqlJoin = ` INNER JOIN${tableJoinAs}`
    const sqlOn = ` ON ${tableJoin}.${fieldJoin} = ${tableOn}.${fieldOn}`
    this.#sqlText += `${sqlJoin}${sqlOn}`
    return this
  }

  orderBy(field: string, order: OrderProp) {
    // check order
    const upperOrder = order.toUpperCase()
    const directions = this.#sqlOrderDirections
    if (!directions.includes(upperOrder)) {
      this.#catch(`Invalid order value (${order}), use: ${directions}`)
    }
    const pField = this.#parseField(field)
    this.#checkField(pField.table, pField.field)

    this.#sqlText += ` ORDER BY ${pField.table}.${pField.field} ${order}`
    return this
  }

  // TODO: implement LIKE
  count() {
    this.#isSingleResult = true
    this.#sqlValues = []
    this.#sqlText = `SELECT COUNT(*)${this.#from()}`
    return this
  }

  whereIn(field: string, values: any[]) {
    this.#sqlText += ' WHERE'

    const { table, field: fieldName } = this.#parseField(field)
    this.#checkField(table, fieldName)

    const tableField = this.#sqlMutation ? fieldName : `${table}.${fieldName}`
    this.#sqlText += ` ${tableField}`
  
    const valuesString: string[] = []
    this.#sqlText += ` IN (`
    values.forEach((value: any) => {
      this.#sqlValues.push(value)
      const i = this.#sqlValues.length
      valuesString.push(`$${i}`)
    })
    this.#sqlText += valuesString.join(',')
    this.#sqlText += `)`

    return this
  }
  /**
     * search
     * @param fields fields to search
     * @param value value to search
     * @returns QueryBuilder
     * @example
     * // table = users
     * // fields = name, email
     * // value = 'john'
     * // sql = SELECT * FROM users WHERE name LIKE '%john%' OR email LIKE '%john%'
     * query.where([{ field: 'name', value: 'john' }, { field: 'email', value: 'john' }])
     * query.where([{ field: 'name' }, { field: 'email' }], 'john')
     * query.where({ field: 'name', value: 'john' }, 'john')
     * query.where({ field: 'name' }, 'john')
     * query.where([{ field: 'name', mode: 'like' }, { field: 'email', mode: 'like' }], 'john')
     * query.where(['name' }, { 'email' }], 'john')
     * query.where('name', 'john')
     */
  where(fields: SearchItem[] | SearchItem | string[] | string, value: any = '', modeProp: Mode = '=') {
    const defaultValue = value
    const defaultMode = modeProp ? modeProp.toUpperCase() : '='
    this.#sqlText += ' WHERE'

    const items: SearchItem[] = []
    if (Array.isArray(fields)) {
      fields.forEach((item) => {
        if (typeof item === 'string') {
          items.push({ field: item, value: defaultValue })
        } else {
          items.push(item)
        }
      })
    } else {
      items.push(typeof fields === 'string' ? { field: fields } : fields)
    }

    const itemsLen = items.length
    items.forEach((item, index) => {
      const searchValue = item.value || defaultValue
      const mode = item.mode?.toUpperCase() || defaultMode
      const op = item.operator?.toUpperCase() || 'OR'
      if (!item.field) this.#catch('Define field name')
      if (!modeOpts.includes(mode)) this.#catch(this.#errorModeMsg(item.field))
      if (!operatorOpts.includes(op)) this.#catch(this.#errorOpMsg(item.field))
      if (!searchValue) this.#catch(`Define value with a field (${item.field})`)

      this.#sqlValues.push(searchValue)
      const { table, field } = this.#parseField(item.field)
      this.#checkField(table, field)

      const valuesLen = this.#sqlValues.length

      const percent = ['LIKE', 'ILIKE'].includes(mode) ? "'%'" : ''
      const orSymbol = ['LIKE', 'ILIKE'].includes(mode) ? ' || ' : ''
      const tableField = this.#sqlMutation ? field : `${table}.${field}`

      this.#sqlText += ` ${tableField} ${mode} ${percent}${orSymbol}$${valuesLen}${orSymbol}${percent}`
      if (index < itemsLen - 1) {
        this.#sqlText += ` ${op}`
      }
      if (this.#sqlDelete || this.#sqlMutation) {
        this.#sqlMutation = false
        this.#sqlText += ' RETURNING *'
      }
      return this
    })
    return this
  }

  insert(insertProps: IMutation) {
    const filterProps: IMutation = insertProps
    this.#sqlMutation = true
    this.#sqlValues = []
    this.#sqlText = `INSERT INTO ${this.#sqlTable}`
    let sqlFields = ''
    let sqlValues = ''
    Object.keys(filterProps).forEach((field, _index, arr) => {
      const parsedField = this.#parseField(field)
      // insert allwas with base table name
      const table = this.#getTable(parsedField.table)
      this.#checkMutationField(table, parsedField.field)
      const value = filterProps[field]
      this.#sqlValues.push(value)

      sqlFields += parsedField.field
      sqlValues += `$${this.#sqlValues.length}`
      if (_index < arr.length - 1) {
        sqlFields += ','
        sqlValues += ','
      }
    })
    this.#sqlText += ` (${sqlFields}) VALUES (${sqlValues}) RETURNING *`
    return this
  }

  update(updateProps: IMutation) {
    this.#sqlMutation = true
    this.#sqlValues = []
    this.#sqlText = `UPDATE ${this.#sqlTable} SET`
    Object.keys(updateProps).forEach((field, _index, arr) => {
      const parsedField = this.#parseField(field)
      // update allwas with base table name
      const table = this.#getTable(parsedField.table)
      this.#checkMutationField(table, parsedField.field)
      const value = updateProps[field]
      this.#sqlValues.push(value)
      this.#sqlText += ` ${parsedField.field} = $${this.#sqlValues.length}`
      if (_index < arr.length - 1) {
        this.#sqlText += ','
      }
    })
    return this
  }

  delete() {
    this.#sqlDelete = true
    this.#sqlMutation = true
    this.#sqlValues = []
    this.#sqlText = `DELETE FROM ${this.#sqlTable}`
    return this
  }

  async run() {
    const sql = this.#sqlText
    const values = this.#sqlValues
    if (this.#debug) {
      this.print()
    }
    if (!this.#sqlRun) {
      this.#catch('Implement run method')
      return
    }
    return this.#sqlRun(sql, values, this.#isSingleResult)
  }

  build() {
    const output: any = {
      text: this.#sqlText,
      values: this.#sqlValues,
      table: this.#sqlTable,
      selectOne: this.#isSingleResult
    }
    if (this.#sqlMutation) {
      output.mutateFields = this.#sqlMutateFields
    } else {
      output.fields = this.#sqlFields
    }
    return output
  }

  // debug utils
  print() {
    console.log(this.build())
  }

  // error mesagges
  #errorModeMsg = (field: string) => `Use [${modeOpts}] into mode  with a field (${field})`
  #errorOpMsg = (field: string) => `Use [${operatorOpts}] into operator  with a field (${field})`
}

export const initQueryBuilder = (props: QueryBuilderProps) => {
  const init = props
  return () => new QueryBuilder(init)
}

const getAllowedField = (allowedFields: string[], model: { [key: string]: string }) => {
  const output: { [key: string]: string } = {}
  Object.keys(model).forEach((key: string) => {
    if (allowedFields.includes(key)) {
      output[key] = model[key]
    }
  })
  return output
}

export const Utils = {
  getAllowedField
}

export default QueryBuilder
