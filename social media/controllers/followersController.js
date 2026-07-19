const Followers = require('../db/followers');
const Users     = require('../db/users');

async function toggleFollow(req, res) {
  try {
    const targetId = parseInt(req.params.userId, 10);
    if (isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });

    // Prevent self-follow (server-side enforcement on top of DB CHECK)
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const target = await Users.findById(targetId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    const result = await Followers.toggle(req.user.id, targetId);
    return res.json(result);
  } catch (err) {
    console.error('toggleFollow error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getFollowers(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });
    const list = await Followers.getFollowers(userId);
    return res.json(list);
  } catch (err) {
    console.error('getFollowers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getFollowing(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });
    const list = await Followers.getFollowing(userId);
    return res.json(list);
  } catch (err) {
    console.error('getFollowing error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { toggleFollow, getFollowers, getFollowing };
