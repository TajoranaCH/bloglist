const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  return response.json(blogs)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const currentBlog = await Blog.findById(request.params.id)

  const updatedBlog = {
    ...currentBlog.toJSON(),
    likes: body.likes,
  }
  const res = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
  response.json(res)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) return response.status(400).end()
  if (!request.body.likes) request.body.likes = 0
  const blog = new Blog(request.body)
  const result = await blog.save()
  return response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter