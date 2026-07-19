const pool = require('./pool');

const Comments = {
  async findByPost(postId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return rows;
  },

  async create({ post_id, user_id, content }) {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, user_id, content]
    );
    return result.insertId;
  },

  async delete(commentId, userId) {
    const [result] = await pool.query(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Comments;
