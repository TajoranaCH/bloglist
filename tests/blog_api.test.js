const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const helper = require('./test_helper')

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blog')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('initial blogs are asa expected', async () => {
  const response = await api.get('/api/blog')
  assert.deepStrictEqual(response.body.map(b => {
    delete b.id
    return b
  }), helper.initialBlogs)
})

test('blog id should be id not _id', async () => {
  const response = await api.get('/api/blog')
  assert.strictEqual(response.body.some(b => {
    return b._id && !b.id
  }), false)
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  }

  await api
    .post('/api/blog')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blog')

  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

  assert(titles.includes('Type wars'))
})
after(async () => {
  await mongoose.connection.close()
})