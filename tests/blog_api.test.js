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

after(async () => {
  await mongoose.connection.close()
})