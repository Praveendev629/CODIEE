const File    = require('../models/File');
const Project = require('../models/Project');
const { detectLanguage } = require('../utils/languageDetector');

exports.listFiles = async (req, res, next) => {
  try { res.json(await File.find({ projectId: req.params.projectId, userId: req.user._id })); }
  catch (err) { next(err); }
};

exports.getFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) { next(err); }
};

exports.createFile = async (req, res, next) => {
  try {
    const { name, content = '', folderPath = '/' } = req.body;
    if (!name) return res.status(400).json({ message: 'File name required' });
    const path = (folderPath === '/' ? '' : folderPath) + '/' + name;
    const file = await File.create({
      projectId: req.params.projectId, userId: req.user._id,
      name, content, path, folderPath, language: detectLanguage(name),
    });
    req.app.get('io').to(`project:${req.params.projectId}`).emit('file:created', file);
    res.status(201).json(file);
  } catch (err) { next(err); }
};

exports.updateFile = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.content !== undefined) update.content = req.body.content;
    if (req.body.name) update.name = req.body.name;
    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, userId: req.user._id }, { $set: update }, { new: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });
    req.app.get('io').to(`project:${req.params.projectId}`).emit('file:updated', file);
    res.json(file);
  } catch (err) { next(err); }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.fileId, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    req.app.get('io').to(`project:${req.params.projectId}`).emit('file:deleted', { fileId: req.params.fileId });
    res.json({ message: 'File deleted' });
  } catch (err) { next(err); }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentPath = '/' } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const newPath = (parentPath === '/' ? '' : parentPath) + '/' + name;
    project.folders.push({ name, path: newPath, parentPath });
    await project.save();
    req.app.get('io').to(`project:${req.params.projectId}`).emit('folder:created', { name, path: newPath, parentPath });
    res.status(201).json({ name, path: newPath, parentPath });
  } catch (err) { next(err); }
};
