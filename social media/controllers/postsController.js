const Posts = require('../db/posts');

async function getAllPosts(req, res) {
  try {
    const posts = await Posts.findAll(req.user.id);
    return res.json(posts);
  } catch (err) {
    console.error('getAllPosts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getFollowingFeed(req, res) {
  try {
    const posts = await Posts.findFollowingFeed(req.user.id);
    return res.json(posts);
  } catch (err) {
    console.error('getFollowingFeed error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getPost(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    const post = await Posts.findById(postId, req.user.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(post);
  } catch (err) {
    console.error('getPost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getPostsByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });
    const posts = await Posts.findByUser(userId, req.user.id);
    return res.json(posts);
  } catch (err) {
    console.error('getPostsByUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createPost(req, res) {
  try {
    const { content, image_url } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Post content must be under 2000 characters' });
    }
    if (image_url && image_url.length > 500) {
      return res.status(400).json({ error: 'Image URL too long' });
    }

    const id = await Posts.create({
      user_id:   req.user.id,
      content:   content.trim(),
      image_url: image_url || null,
    });
    const post = await Posts.findById(id, req.user.id);
    return res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deletePost(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    const deleted = await Posts.delete(postId, req.user.id);
    if (!deleted) return res.status(403).json({ error: 'Not found or not your post' });
    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getAllPosts, getFollowingFeed, getPost, getPostsByUser, createPost, deletePost };
