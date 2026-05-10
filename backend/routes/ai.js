const Groq = require("groq-sdk");
const Project = require("../models/Project");
const AIHistory = require("../models/AIHistory");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ===============================
// CHAT WITH MEMORY (PER PROJECT)
// ===============================
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const { projectId } = req.params;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get previous history
    const history = await AIHistory.find({ projectId }).sort({ createdAt: 1 });

    const messages = [
      {
        role: "system",
        content:
          "You are CODIEE AI, a powerful coding assistant. Help with debugging, refactoring, explanations, and generating production-ready code.",
      },
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiReply = completion.choices[0]?.message?.content || "No response";

    // Save user message
    await AIHistory.create({
      projectId,
      role: "user",
      content: message,
    });

    // Save AI response
    await AIHistory.create({
      projectId,
      role: "assistant",
      content: aiReply,
    });

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("AI CHAT ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "AI request failed",
      error: error.response?.data || error.message,
    });
  }
};

// ===============================
// SIMPLE COMPLETION (NO MEMORY)
// ===============================
exports.complete = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are CODIEE AI, a professional software engineer assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    res.json({
      reply: completion.choices[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error("AI COMPLETE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "AI completion failed",
      error: error.response?.data || error.message,
    });
  }
};

// ===============================
// GET CHAT HISTORY
// ===============================
exports.getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const history = await AIHistory.find({ projectId }).sort({
      createdAt: 1,
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// ===============================
// CLEAR CHAT HISTORY
// ===============================
exports.clearHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    await AIHistory.deleteMany({ projectId });

    res.json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear history" });
  }
};