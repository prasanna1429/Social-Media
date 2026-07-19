const Comments = require('../db/comments');
const Posts    = require('../db/posts');

async function getComments(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });
    const comments = await Comments.findByPost(postId);
    return res.json(comments);
  } catch (err) {
    console.error('getComments error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function addComment(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment must be under 1000 characters' });
    }

    // Confirm post exists
    const post = await Posts.findById(postId, req.user.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const id = await Comments.create({ post_id: postId, user_id: req.user.id, content: content.trim() });
    const [comment] = await Comments.findByPost(postId).then(list => list.filter(c => c.id === id));
    return res.status(201).json(comment);
  } catch (err) {
    console.error('addComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    if (isNaN(commentId)) return res.status(400).json({ error: 'Invalid comment id' });

    const deleted = await Comments.delete(commentId, req.user.id);
    if (!deleted) return res.status(403).json({ error: 'Not found or not your comment' });
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getComments, addComment, deleteComment };
