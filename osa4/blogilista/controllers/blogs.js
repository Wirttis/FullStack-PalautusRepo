const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')




blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {


  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(403).json({ error: 'not allowed' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body

  const user = request.user

  /*
  let user = await User.findById(body.userId)

  if (!user) {
    user = await User.findOne({})
  }   

  if (!user) {
    return response.status(400).json({ error: 'no users available' })
  }
 */
  if (!user) {
    return response.status(400).json({ error: 'UserId missing or not valid' })
  }
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id,
    likes: body.likes || 0
  })
  

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.put('/:id',async (request, response) => {
  const { title, author, user, url, likes} = request.body

  const blog = await Blog.findById(request.params.id)
    
  if (!blog) {
    return response.status(404).end()
  }
      
  blog.title = title
  blog.author = author
  blog.url = url
  blog.user = user
  blog.likes = likes

  const updatedBlog = await blog.save()
  return response.json(updatedBlog)
})


module.exports = blogsRouter