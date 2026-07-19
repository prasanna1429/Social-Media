const Users     = require('../db/users');
const Followers = require('../db/followers');

async function getProfile(req, res) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });

    const user = await Users.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Is the requesting user following this profile?
    const isFollowing = await Followers.isFollowing(req.user.id, targetId);

    // Never expose the hashed password
    const { password: _pw, ...safeUser } = user;
    return res.json({ ...safeUser, is_following: isFollowing });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { bio, avatar_url } = req.body;

    if (avatar_url && avatar_url.length > 500) {
      return res.status(400).json({ error: 'Avatar URL too long' });
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be under 500 characters' });
    }

    await Users.updateProfile(req.user.id, {
      bio:        bio        || null,
      avatar_url: avatar_url || null,
    });

    const updated = await Users.findById(req.user.id);
    const { password: _pw, ...safeUser } = updated;
    return res.json(safeUser);
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getMe(req, res) {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, getMe };
