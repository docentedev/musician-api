import { FastifyInstance } from 'fastify'
import getContentType from '../../utils/getContentType'
import musiciansDb from '../../models/musicians'
import Auth from '../../utils/Auth'

const fs = require('fs')
const util = require('util')
const path = require('path')
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)

const routes = async (fastify: FastifyInstance, opts: any, done: () => void) => {
  const qb = musiciansDb(fastify.pg)
  fastify.post('/', {
    preHandler: [Auth.rolesMiddleware(fastify, ['admin'])],
    handler: async (req: any, reply: any) => {
      const file = await req.file()
      const uploadPath = path.join(__dirname, '../../../../uploads')

      const ext = path.extname(file.filename)
      const id = file.fields.id.value
      const filePath = path.join(uploadPath, `${id}${ext}`)

      // update musician image
      const { image: prevImage } = await qb.getBy('id', id)
      // remove previous image
      if (prevImage) {
        try {
          fs.unlinkSync(path.join(uploadPath, prevImage))
        } catch (error) {
          console.log(error)
        }
      }
      console.log(file.fields.id.value)
      console.log(file)
      await pump(file.file, fs.createWriteStream(filePath))
      const result = await qb.updateImage(id, `${id}${ext}`)
      reply.send(result)
    }
  })

  fastify.get('/:filename', {
    handler: async (req: any, reply: any) => {
      const filename = req.params.filename
      const uploadPath = path.join(__dirname, '../../../../uploads')
      const filePath = path.join(uploadPath, filename)
      try {
        const buffer = fs.readFileSync(filePath)
        reply.header('Content-Type', getContentType(filePath))
        reply.send(buffer)
      } catch (error) {
        reply.status(404).send({ error: 'File not found' })
      }
    }
  })

  done()
}

export default routes
