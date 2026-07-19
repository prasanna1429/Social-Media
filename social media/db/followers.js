const pool = require('./pool');

const Followers = {
  async isFollowing(followerId, followingId) {
    const [rows] = await pool.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ? LIMIT 1',
      [followerId, followingId]
    );
    return rows.length > 0;
  },

  async toggle(followerId, followingId) {
    const already = await this.isFollowing(followerId, followingId);
    if (already) {
      await pool.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );
      return { following: false };
    } else {
      await pool.query(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId]
      );
      return { following: true };
    }
  },

  async getFollowers(userId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM followers f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async getFollowing(userId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM followers f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = Followers;
