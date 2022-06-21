const Run = (pg: any) => async (sql: string, values: any[], single: Boolean) => {
  return new Promise((resolve: (result: any) => void, reject: (err: Error) => void) => {
    pg.connect((e: Error, client: pg.Client, release: () => Promise<any>) => {
      function onResult(err: Error, result: pg.Result<any> | any) {
        release()
        if (err) {
          reject(err)
        } else {
          if (single) {
            resolve(result.rows[0])
          } else {
            resolve(result.rows)
          }
        }
      }

      if (e) {
        release()
        reject(e)
      } else {
        if (values.length === 0) {
          client.query(sql, onResult)
        } else {
          client.query(sql, values, onResult)
        }
      }
    })
  })
}

export default Run
