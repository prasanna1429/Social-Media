const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Users    = require('../db/users');

// ── Helpers ──────────────────────────────────────────────────────────────────

function issueToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Controllers ───────────────────────────────────────────────────────────────

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Server-side validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'Username must be 3–32 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Uniqueness checks
    const existingEmail    = await Users.findByEmail(email);
    const existingUsername = await Users.findByUsername(username);
    if (existingEmail)    return res.status(409).json({ error: 'Email already registered' });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    // Hash password — never store plaintext
    const hashed = await bcrypt.hash(password, 12);
    const id = await Users.create({ username, email, password: hashed });

    const token = issueToken({ id, username, email });
    return res.status(201).json({ token, user: { id, username, email } });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await Users.findByEmail(email);
    // Use generic message to avoid email enumeration
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = issueToken(user);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login };
