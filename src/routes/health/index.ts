import { FastifyInstance, UserRequest } from 'fastify'

const routes = async (fastify: FastifyInstance, _opts: any, done: Function) => {
  fastify.get('/', async (req: UserRequest, reply) => {
    const data = {
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date()
    }
    reply.send(data)
  })
  done()
}

export default routes
