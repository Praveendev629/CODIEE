const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:        { type: String, enum: ['user', 'assistant'], required: true },
  content:     { type: String, required: true },
  codeSnippet: { type: String, default: null },
  timestamp:   { type: Date, default: Date.now },
}, { _id: true });

const chatHistorySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  messages:  [messageSchema],
}, { timestamps: true });

chatHistorySchema.index({ projectId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model('ChatHistory', chatHistorySchema);
