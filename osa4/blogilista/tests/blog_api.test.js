const assert = require('node:assert')
const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
   
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
   
  },
]
describe('when getting blogs', () => {
  beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
  })
  test('all blogs have correct id name', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)

    response.body.forEach(blog => {
      assert.ok(blog.id)
    })
  })


  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      response.body.length,
      initialBlogs.length
    )
  })
})
describe('when creating a blog with authentication', () => {
  let token

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    await Blog.insertMany(initialBlogs)

    const user = await User.create({
      username: 'testuser',
      name: 'Test User',
      passwordHash: 'hash'
    })

    token = helper.getToken(user)
  })

  test('adding a blog increases the number of blogs', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'John Doe',
      url: 'https://example.com',
      likes: 5
    }

    const blogsAtStart = await Blog.find({})

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const blogsAtEnd = await Blog.find({})

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
  })


  test('likes defaults to 0', async () => {
    const newBlog = {
      title: 'AAAAAAA',
      author: 'Me',
      url: 'bruh'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const blogs = await Blog.find({ title: 'AAAAAAA' })

    assert.strictEqual(blogs[0].likes, 0)
  })


  test('blog without title returns status 400', async () => {
    const newBlog = {
      author: 'C',
      url: 'bruh',
      likes: 67
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })


  test('blog without author returns status 400', async () => {
    const newBlog = {
      title: 'BBBBBB',
      url: 'bruh',
      likes: 67
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })


  test('creating a blog without valid token returns 401', async () => {
    const newBlog = {
      title: 'Unauthorized blog',
      author: 'Nobody',
      url: 'https://example.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    const blogs = await Blog.find({})

    assert.strictEqual(blogs.length, initialBlogs.length)
  })


  test('creating a blog without token returns 401', async () => {
    const newBlog = {
      title: 'No token blog',
      author: 'Nobody',
      url: 'https://example.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogs = await Blog.find({})

    assert.strictEqual(blogs.length, initialBlogs.length)
  })

  test('updating a blog', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]
    console.log(blogToUpdate)

    const updatedBlog = {
      title: 'Bruh',
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 100
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    

    assert.strictEqual(response.body.title,'Bruh')
    assert.strictEqual(response.body.likes,100)

    const blogsAtEnd = await Blog.find({})

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

    const updatedBlogInDb = blogsAtEnd.find(
      blog => blog.id === blogToUpdate.id
    )

    assert.strictEqual(updatedBlogInDb.title,'Bruh')
    assert.strictEqual(updatedBlogInDb.likes,100)
  })

})

describe('DELETE /api/blogs/:id authentication', () => {
  let user
  let blog

  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    user = await helper.initialUsers()
    blog = await Blog.create({
      title: 'Test blog',
      author: 'Test author',
      url: 'http://test.com',
      likes: 5,
      user: user[0]._id
    })
  })

  test('deleting without token fails with 401', async () => {
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(401)

    const blogs = await Blog.find({})
    assert.strictEqual(blogs.length,1)
  })


  test('deleting with invalid token fails with 401', async () => {
    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    const blogs = await Blog.find({})
    assert.strictEqual(blogs.length,1)
  })


  test('user cannot delete another users blog', async () => {
    const anotherUser = await User.create({
      username: 'anotheruser',
      name: 'Another User',
      passwordHash: 'hash'
    })

    const token = helper.getToken(anotherUser)

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    const blogs = await Blog.find({})
    assert.strictEqual(blogs.length,1)
  })


  test('user can delete their own blog', async () => {
    const token = helper.getToken(user[0])

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogs = await Blog.find({})
    assert.strictEqual(blogs.length,0)
  })
})
after(() => {
  return mongoose.connection.close()
})