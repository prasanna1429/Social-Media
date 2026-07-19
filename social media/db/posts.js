const pool = require('./pool');

const Posts = {
  // All posts (global feed), newest first
  async findAll(requestingUserId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at,
              u.id AS user_id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
              EXISTS(
                SELECT 1 FROM likes
                WHERE post_id = p.id AND user_id = ?
              ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`,
      [requestingUserId]
    );
    return rows;
  },

  // Posts from users the requestingUser follows
  async findFollowingFeed(requestingUserId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at,
              u.id AS user_id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
              EXISTS(
                SELECT 1 FROM likes
                WHERE post_id = p.id AND user_id = ?
              ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id IN (
         SELECT following_id FROM followers WHERE follower_id = ?
       )
       ORDER BY p.created_at DESC`,
      [requestingUserId, requestingUserId]
    );
    return rows;
  },

  // Single post
  async findById(postId, requestingUserId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at,
              u.id AS user_id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
              EXISTS(
                SELECT 1 FROM likes
                WHERE post_id = p.id AND user_id = ?
              ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ? LIMIT 1`,
      [requestingUserId, postId]
    );
    return rows[0] || null;
  },

  // Posts by a specific user
  async findByUser(userId, requestingUserId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at,
              u.id AS user_id, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
              EXISTS(
                SELECT 1 FROM likes
                WHERE post_id = p.id AND user_id = ?
              ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [requestingUserId, userId]
    );
    return rows;
  },

  async create({ user_id, content, image_url }) {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [user_id, content, image_url || null]
    );
    return result.insertId;
  },

  async delete(postId, userId) {
    const [result] = await pool.query(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Posts;
