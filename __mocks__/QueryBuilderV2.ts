const QueryBuilderV2 = () => {
    class QB {
        pg: any = null
        constructor(props: any) {
            this.pg = props.run
        }
        selectOne() {
            return this
        }
        select() {
            return this
        }
        orderBy() {
            return this
        }
        paginate() {
            return this
        }
        where() {
            return this
        }
        count() {
            return this
        }
        innerJoin() {
        }
        async run() {
            return this.pg('sql', [], false)
        }
    }
    return {
        initQueryBuilder: (props: any) => () => new QB(props)
    }
}

export default QueryBuilderV2
