const logger = require('./logger')

module.exports.requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

module.exports.unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports.errorHandler = (error, request, response, next) => {
  if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }

  switch (error.name) {
  case 'CastError':
    return response.status(400).send({ error: 'malformatted id' })
  case 'ValidationError':
    return response.status(400).json({ error: error.message })
  case 'JsonWebTokenError':
    return response.status(400).json({ error: 'token missing or invalid' })
  case 'UserPasswordLength':
    return response.status(400).json({ error: 'User and Password length should be at least 3 chars.' })
  }

  next(error)
}

module.exports.tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}
