const pool = require('./pool');

const Users = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.bio, u.avatar_url, u.created_at,
              (SELECT COUNT(*) FROM posts    WHERE user_id = u.id)                   AS post_count,
              (SELECT COUNT(*) FROM followers WHERE following_id = u.id)             AS followers_count,
              (SELECT COUNT(*) FROM followers WHERE follower_id  = u.id)             AS following_count
       FROM users u
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ username, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result.insertId;
  },

  async updateProfile(id, { bio, avatar_url }) {
    await pool.query(
      'UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?',
      [bio, avatar_url, id]
    );
  },
};

module.exports = Users;
