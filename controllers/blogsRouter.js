const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  return response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) return response.status(400).end()
  if (!request.body.likes) request.body.likes = 0
  const blog = new Blog(request.body)
  const result = await blog.save()
  return response.status(201).json(result)
})

module.exports = blogsRouter