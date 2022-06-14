import { FastifyInstance, UserRequest } from 'fastify'
import musiciansDb from '../../models/musicians'

const routes = (instance: FastifyInstance, opts: any, next: () => void) => {
  const qb = musiciansDb(instance.pg)
  instance.get('/', async (req: UserRequest, reply) => {
    try {
      const { page = 1, size = 10, sort = 'desc', order = 'id' } = req.query
      const result = await qb.getAllPaginate({ page, size, sort, order })
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  instance.get('/:id', async (req: UserRequest, reply) => {
    try {
      const result = await qb.getBy('id', req.params.id)
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  instance.delete('/:id', async (req: UserRequest, reply) => {
    try {
      const result = await qb.deleteById(req.params.id)
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  instance.put('/:id', async (req: UserRequest, reply) => {
    try {
      const result = await qb.update(req.params.id, req.body)
      reply.send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  instance.post('/', async (req: UserRequest, reply) => {
    try {
      const result = await qb.insert(req.body)
      // 201 Created
      reply.code(201).send(result)
    } catch (error) {
      reply.send(error)
    }
  })

  next()
}

export default routes
