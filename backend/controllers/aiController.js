const ChatHistory = require('../models/ChatHistory');
const { getAIResponse, getCodeCompletion } = require('../services/aiService');

exports.chat = async (req, res, next) => {
  try {
    const { message, codeSnippet, action = 'chat' } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });
    let history = await ChatHistory.findOne({ projectId: req.params.projectId, userId: req.user._id });
    if (!history) history = await ChatHistory.create({ projectId: req.params.projectId, userId: req.user._id, messages: [] });
    const userContent = codeSnippet ? `${message}\n\n\`\`\`\n${codeSnippet}\n\`\`\`` : message;
    history.messages.push({ role: 'user', content: userContent, codeSnippet });
    await history.save();
    const ctx = history.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
    const reply = await getAIResponse(ctx, action);
    history.messages.push({ role: 'assistant', content: reply });
    await history.save();
    res.json({ reply });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const h = await ChatHistory.findOne({ projectId: req.params.projectId, userId: req.user._id });
    res.json(h ? h.messages : []);
  } catch (err) { next(err); }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { projectId: req.params.projectId, userId: req.user._id }, { $set: { messages: [] } }
    );
    res.json({ message: 'Cleared' });
  } catch (err) { next(err); }
};

exports.complete = async (req, res, next) => {
  try {
    const { prefix, language = 'javascript' } = req.body;
    if (!prefix) return res.status(400).json({ message: 'prefix required' });
    const completion = await getCodeCompletion(prefix, language);
    res.json({ completion });
  } catch (err) { next(err); }
};

const Groq = require("groq-sdk");
const Project = require("../models/Project");
const AIHistory = require("../models/ChatHistory");

// everything else exactly same