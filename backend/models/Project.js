const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  path:       { type: String, required: true },
  parentPath: { type: String, default: '/' },
}, { _id: true });

const projectSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  folders:     [folderSchema],
  githubRepo:  { type: String, default: null },
  isPublic:    { type: Boolean, default: false },
  lastOpened:  { type: Date, default: Date.now },
}, { timestamps: true });

projectSchema.index({ userId: 1, name: 1 });
module.exports = mongoose.model('Project', projectSchema);
