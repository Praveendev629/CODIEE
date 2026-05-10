const Project  = require('../models/Project');
const File     = require('../models/File');
const archiver = require('archiver');

exports.listProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ lastOpened: -1 });
    res.json(projects);
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name required' });
    const project = await Project.create({ userId: req.user._id, name, description });
    res.status(201).json(project);
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.lastOpened = new Date(); await project.save();
    const files = await File.find({ projectId: project._id }).select('-content');
    res.json({ project, files });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await File.deleteMany({ projectId: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

exports.downloadProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const files = await File.find({ projectId: project._id });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}.zip"`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    for (const f of files) archive.append(f.content, { name: f.path.replace(/^\//, '') });
    await archive.finalize();
  } catch (err) { next(err); }
};
