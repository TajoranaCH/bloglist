const { test, after, beforeEach, describe } = require('node:test')
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
describe('blog retreival tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blog')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('initial blogs are as expected', async () => {
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
})

describe('blog addition tests', () => {
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

  test('likes default to zero if missing', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blog')
    const addedBlog = response.body.find(b => b.title === 'Type wars')

    assert.strictEqual(addedBlog.likes, 0)
  })

  test('if title missing status 400', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(400)
  })

  test('if title missing status 400', async () => {
    const newBlog = {
      title: 'asd asd',
      author: 'Robert C. Martin',
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blog/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })
})

describe('updation of a blog', () => {
  test('succeeds with status code 200 and update likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const newLikes = {
      likes: 47
    }
    await api
      .put(`/api/blog/${blogToUpdate.id}`)
      .send(newLikes)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    const likes = blogsAtEnd.map(r => r.likes)
    assert(likes.includes(newLikes.likes))
  })
})

after(async () => {
  await mongoose.connection.close()
})