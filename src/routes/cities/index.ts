import { FastifyInstance, CustomRequest } from 'fastify'
import citiesDb from '../../models/cities'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  const qb = citiesDb(fastify.pg)
  fastify.get('/', async (req: CustomRequest, reply) => {
    try {
      const { page = 1, size = 10, sort = 'desc', order = 'id' } = req.query
      const result = await qb.getAllPaginate({ page, size, sort, order })
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  fastify.get('/:id', async (req: CustomRequest, reply) => {
    try {
      const result = await qb.getBy('id', req.params.id)
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  // /search?q=%s&fields=%s
  fastify.get('/search', async (req: CustomRequest, reply) => {
    try {
      const { q } = req.query
      if (!q || `${q ?? ''}`.length < 3) {
        throw new Error('Search query must be at least 3 characters long')
      }
      const result = await qb.search(q)
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })
  done()
}

export default routes
