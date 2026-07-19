require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/posts',     require('./routes/posts'));
app.use('/api/posts',     require('./routes/comments'));   // /api/posts/:postId/comments
app.use('/api/posts',     require('./routes/likes'));      // /api/posts/:postId/like
app.use('/api/users',     require('./routes/followers'));  // /api/users/:userId/follow

// ── SPA fallback — serve index.html for unmatched routes ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  SocialMini running on http://localhost:${PORT}`));
