const pool = require('./pool');

const Likes = {
  async toggle(postId, userId) {
    // Check if already liked
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );

    if (existing.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      return { liked: false };
    } else {
      // Like — DB unique constraint is the final safety net
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      return { liked: true };
    }
  },

  async countByPost(postId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );
    return rows[0].count;
  },
};

module.exports = Likes;
