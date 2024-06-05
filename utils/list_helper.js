const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((t, b) => {
    if (b.likes) {
      t += b.likes
    }
    return t
  }, 0)
}

const favouriteBlog = (blogs) => {
  let result = null
  blogs.forEach((b) => {
    if (!result || b.likes > result.likes) {
      result = b
    }
  })
  return result
}
module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}