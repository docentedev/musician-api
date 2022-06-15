import { FastifyRequest } from 'fastify'

declare global {
    namespace entity {
        export interface Musician {
            id: string
            first_name: string
            last_name: string
            city_fk: number
            alias: string
            birth_date: Date
            death_date: Date
            second_last_name: string
            second_name: string
        }
    }
    namespace pg {
        export interface Client {
            query<T>(query: string, values: any[], callback: (err: Error, result: Result<T>) => void): any
            query<T>(query: string, callback: (err: Error, result: Result<T>) => void): any
            query<T>(query: string): Promise<Result<T>>
            query<T>(query: string, values: any[]): Promise<Result<T>>
        }
        export interface Pg {
            connect: (onConnect: (err: Error, client: Client, release: () => Promise<any>) => void) => void
        }

        export interface Field {
            name: string
            tableID: number
            columnID: number
            dataTypeID: number
            dataTypeSize: number
            dataTypeModifier: number
            format: string
        }

        export interface ArrayParser {
        }

        export interface Builtins {
            BOOL: number
            BYTEA: number
            CHAR: number
            INT8: number
            INT2: number
            INT4: number
            REGPROC: number
            TEXT: number
            OID: number
            TID: number
            XID: number
            CID: number
            JSON: number
            XML: number
            PG_NODE_TREE: number
            SMGR: number
            PATH: number
            POLYGON: number
            CIDR: number
            FLOAT4: number
            FLOAT8: number
            ABSTIME: number
            RELTIME: number
            TINTERVAL: number
            CIRCLE: number
            MACADDR8: number
            MONEY: number
            MACADDR: number
            INET: number
            ACLITEM: number
            BPCHAR: number
            VARCHAR: number
            DATE: number
            TIME: number
            TIMESTAMP: number
            TIMESTAMPTZ: number
            INTERVAL: number
            TIMETZ: number
            BIT: number
            VARBIT: number
            NUMERIC: number
            REFCURSOR: number
            REGPROCEDURE: number
            REGOPER: number
            REGOPERATOR: number
            REGCLASS: number
            REGTYPE: number
            UUID: number
            TXID_SNAPSHOT: number
            PG_LSN: number
            PG_NDISTINCT: number
            PG_DEPENDENCIES: number
            TSVECTOR: number
            TSQUERY: number
            GTSVECTOR: number
            REGCONFIG: number
            REGDICTIONARY: number
            JSONB: number
            REGNAMESPACE: number
            REGROLE: number
        }

        export interface Types2 {
            arrayParser: ArrayParser
            builtins: Builtins
        }

        export interface Text {
        }

        export interface Binary {
        }

        export interface Types {
            _types: Types2
            text: Text
            binary: Binary
        }

        export interface Result<T> {
            command: string
            rowCount: number
            oid?: any
            rows: T[]
            fields: Field[]
            _parsers: any[]
            _types: Types
            RowCtor?: any
            rowAsArray: boolean
        }
    }

}

declare module 'fastify' {
    interface FastifyInstance {
        pg: pg.Pg
    }

    export interface FastifyRequest {
        file: () => Promise<{
            file: NodeJS.ReadableStream
            fields: {
                [key: string]: string
            }
            filename: string
            encoding: string
            mimetype: string
        }>
    }

    type CustomRequest = FastifyRequest<{
        Params: { id: number }
        Querystring: { page?: number, size?: number, sort?: 'asc' | 'desc', order?: string, q?: string }
    }>
}