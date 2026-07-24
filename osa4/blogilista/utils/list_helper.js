const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {

    return blogs.reduce((s, p) => s + p.likes, 0) || 0
}

const favoriteBlog = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const index = likes.indexOf(Math.max(...likes))

    return blogs[index]
}


module.exports = {
  dummy, totalLikes, favoriteBlog
}
