class Auth {
    static middleware = (fastify: any) => (request: any, reply: any, next: any) => {
        const authorization = request.headers.authorization
        if (authorization) {
            // console.log(req.user.id)
            const token = authorization.split(' ')[1]
            try {
                const result = fastify.jwt.verify(token)
                request.user = result
                next()
            } catch (error) {
                reply.status(403).send({ message: 'Missing Auth' })
            }
        } else {
            reply.status(403).send({ message: 'Missing Auth' })
        }
    }
    static rolesMiddleware = (fastify: any, roles: string[] = []) => (request: any, reply: any, next: any) => {
        const authorization = request.headers.authorization
        if (authorization) {
            const token = authorization.split(' ')[1]
            try {
                const result = fastify.jwt.verify(token)
                if (Array.isArray(result.roles)) {
                    const found = result.roles.some((r: string) => roles.indexOf(r) >= 0)
                    console.log(found)
                    if (found) next()
                    else reply.status(403).send({ message: 'You do not have sufficient permissions' })
                } else reply.status(403).send({ message: 'You do not have sufficient permissions' })
            } catch (error) {
                reply.status(403).send({ message: 'Missing Auth' })
            }
        } else {
            reply.status(403).send({ message: 'Missing Auth' })
        }
    }
}

export default Auth
