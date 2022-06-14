import Fastify from 'fastify'
import citiesRoute from './routes/cities'
require('dotenv').config()

const PORT = process.env.PORT || 3001
const fastify = Fastify({
  logger: true
})

fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 50 * 1024 * 1024 }
})

fastify.register(require('@fastify/cors'), { origin: '*' })

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL
})

fastify.register(require('./routes/health'), { prefix: 'api/v1/health' })
fastify.register(require('./routes/files'), { prefix: 'api/v1/files' })
fastify.register(require('./routes/musicians'), { prefix: 'api/v1/musicians' })
fastify.register(citiesRoute, { prefix: 'api/v1/cities' })

fastify.listen({
  port: Number(PORT),
  host: '0.0.0.0'
}, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  fastify.log.info(`Server listening on ${address}`)
})
