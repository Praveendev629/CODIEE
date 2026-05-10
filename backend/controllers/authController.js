const jwt         = require('jsonwebtoken');
const axios       = require('axios');
const User        = require('../models/User');
const { encrypt } = require('../services/encryptionService');
const { getUser } = require('../services/githubService');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'Email or username already in use' });
    const user = await User.create({ username, email, password });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, username, email, avatarUrl: null } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: { id: user._id, username: user.username, email, avatarUrl: user.avatarUrl } });
  } catch (err) { next(err); }
};

exports.githubRedirect = (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user`);
};

exports.githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    );
    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.status(400).json({ message: 'GitHub OAuth failed' });
    const ghUser = await getUser(accessToken);
    let user = await User.findOne({ githubId: String(ghUser.id) });
    if (!user) {
      user = await User.create({
        username: ghUser.login,
        email: ghUser.email || `${ghUser.login}@github.local`,
        githubId: String(ghUser.id),
        avatarUrl: ghUser.avatar_url,
        githubTokenEncrypted: encrypt(accessToken),
      });
    } else {
      user.githubTokenEncrypted = encrypt(accessToken);
      user.avatarUrl = ghUser.avatar_url;
      await user.save();
    }
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${sign(user._id)}`);
  } catch (err) { next(err); }
};

exports.getMe = (req, res) => res.json({ user: req.user });
