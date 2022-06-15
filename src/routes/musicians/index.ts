import { FastifyInstance, CustomRequest } from 'fastify'
import musiciansDb from '../../models/musicians'
import Auth from '../../utils/Auth'

const routes = (fastify: FastifyInstance, opts: any, next: () => void) => {
  const qb = musiciansDb(fastify.pg)
  fastify.get('/', {
    handler: async (req: CustomRequest, reply) => {
      try {
        const { page = 1, size = 10, sort = 'desc', order = 'id' } = req.query
        const result = await qb.getAllPaginate({ page, size, sort, order })
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
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

  fastify.delete('/:id', {
    preHandler: [Auth.middleware(fastify)],
    handler: async (req: CustomRequest, reply) => {
      try {
        const result = await qb.deleteById(req.params.id)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })

  fastify.put('/:id', {
    preHandler: [Auth.middleware(fastify)],
    handler: async (req: CustomRequest, reply) => {
      try {
        const result = await qb.update(req.params.id, req.body)
        reply.send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })

  fastify.post('/', {
    preHandler: [Auth.middleware(fastify)],
    handler: async (req: CustomRequest, reply) => {
      try {
        const result = await qb.insert(req.body)
        // 201 Created
        reply.code(201).send(result)
      } catch (error) {
        reply.send(error)
      }
    }
  })

  next()
}

export default routes
