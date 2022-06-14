const Pg = (result: any = {
    rows: [{
        id: 1,
        name: 'test'
    }]
}) => ({
    connect: (callback: Function) => {
        const client = {
            query: (sql: string, call: Function | any[], cb: Function) => {
                // console.log(sql,'-' ,result,'-', cb,'-', callback)
                if (typeof call === 'function') {
                    call(null, result)
                } else {
                    cb(null, result)
                }
            }
        }
        callback(null, client, async () => Promise.resolve())
    },
})

export default Pg