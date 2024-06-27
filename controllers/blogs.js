const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
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

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blogCreator = await User.findById(decodedToken.id)
  if (!request.body.likes) request.body.likes = 0

  const blog = new Blog({ ...request.body, user: blogCreator._id })
  const result = await blog.save()
  blogCreator.blogs = blogCreator.blogs.concat(result._id)

  await User.findByIdAndUpdate(blogCreator._id, blogCreator)

  return response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).end()

  if (!blog.user || blog.user.toString() === decodedToken.id ) {
    const res = await Blog.findByIdAndDelete(request.params.id)
    console.log(res)
    return response.status(204).end()
  }
  response.status(401).json({ error: 'not permitted to user' })
})

module.exports = blogsRouter