const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogs = require('./controllers/blogs')
const users = require('./controllers/users')
const login = require('./controllers/login')
const middleware = require('./utils/middleware')

logger.info('connecting to', config.MONGODB_URI)
mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blog', blogs)
app.use('/api/users', users)
app.use('/api/login', login)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app