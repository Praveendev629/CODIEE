const mongoose = require('mongoose');
const { detectLanguage } = require('../utils/languageDetector');

const fileSchema = new mongoose.Schema({
  projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  name:         { type: String, required: true },
  path:         { type: String, required: true },
  folderPath:   { type: String, default: '/' },
  content:      { type: String, default: '' },
  language:     { type: String, default: 'plaintext' },
  size:         { type: Number, default: 0 },
  lastModified: { type: Date, default: Date.now },
}, { timestamps: true });

fileSchema.index({ projectId: 1, path: 1 }, { unique: true });

fileSchema.pre('save', function(next) {
  this.size = Buffer.byteLength(this.content || '', 'utf8');
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('File', fileSchema);
