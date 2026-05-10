const User    = require('../models/User');
const Project = require('../models/Project');
const File    = require('../models/File');
const { decrypt }  = require('../services/encryptionService');
const gh      = require('../services/githubService');

const tok = async (userId) => {
  const u = await User.findById(userId);
  if (!u?.githubTokenEncrypted) throw Object.assign(new Error('GitHub not connected'), { statusCode: 401 });
  return decrypt(u.githubTokenEncrypted);
};

exports.listRepos   = async (req, res, next) => {
  try { res.json(await gh.listRepos(await tok(req.user._id))); } catch (e) { next(e); }
};

exports.getContents = async (req, res, next) => {
  try {
    const t = await tok(req.user._id);
    res.json(await gh.getContents(t, req.params.owner, req.params.repo, req.query.path || ''));
  } catch (e) { next(e); }
};

exports.getFile = async (req, res, next) => {
  try {
    const t = await tok(req.user._id);
    res.json(await gh.getFileContent(t, req.params.owner, req.params.repo, req.query.path));
  } catch (e) { next(e); }
};

exports.updateFile = async (req, res, next) => {
  try {
    const t = await tok(req.user._id);
    const { path, content, message, sha } = req.body;
    res.json(await gh.putFile(t, req.params.owner, req.params.repo, path, content, message || 'Update via Codiee', sha));
  } catch (e) { next(e); }
};

exports.createRepo = async (req, res, next) => {
  try {
    const t = await tok(req.user._id);
    const { name, description, isPrivate } = req.body;
    res.status(201).json(await gh.createRepo(t, name, description, isPrivate));
  } catch (e) { next(e); }
};

exports.pushProject = async (req, res, next) => {
  try {
    const t = await tok(req.user._id);
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { owner, repo } = req.body;
    const files = await File.find({ projectId: project._id });
    let count = 0;
    for (const f of files) {
      const filePath = f.path.replace(/^\//, '');
      let sha = null;
      try { const ex = await gh.getFileContent(t, owner, repo, filePath); sha = ex.sha; } catch {}
      await gh.putFile(t, owner, repo, filePath, f.content, `Push via Codiee — ${project.name}`, sha);
      count++;
    }
    project.githubRepo = `${owner}/${repo}`; await project.save();
    res.json({ message: `Pushed ${count} files to ${owner}/${repo}`, count });
  } catch (e) { next(e); }
};
