const Likes = require('../db/likes');
const Posts = require('../db/posts');

async function toggleLike(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    // Confirm post exists
    const post = await Posts.findById(postId, req.user.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const result    = await Likes.toggle(postId, req.user.id);
    const likeCount = await Likes.countByPost(postId);
    return res.json({ ...result, like_count: likeCount });
  } catch (err) {
    // Catch DB-level duplicate key violation as a safety net
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already liked' });
    }
    console.error('toggleLike error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { toggleLike };
