const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = `You are Codiee AI, an expert coding assistant inside a VS Code-like IDE.
Help developers explain code, fix bugs, refactor, and generate new code.
Always use markdown code blocks with language identifiers.`;

const PREFIXES = {
  explain:  'Explain this code in detail:\n\n',
  fix:      'Find and fix all bugs. Show fixed code and explain each fix:\n\n',
  refactor: 'Refactor for better readability and performance:\n\n',
  generate: 'Generate the requested code (complete, production-ready):\n\n',
  chat:     '',
};

exports.getAIResponse = async (messages, action = 'chat') => {
  const formatted = messages.map((m, i) => {
    if (i === messages.length - 1 && m.role === 'user' && action !== 'chat')
      return { ...m, content: PREFIXES[action] + m.content };
    return m;
  });
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: SYSTEM }, ...formatted],
    temperature: 0.3,
    max_tokens: 4096,
  });
  return res.choices[0].message.content;
};

exports.getCodeCompletion = async (prefix, language) => {
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Code completion engine. Return ONLY the completion, no explanations.' },
      { role: 'user', content: `Complete this ${language} code:\n\n${prefix}` },
    ],
    temperature: 0.1,
    max_tokens: 512,
  });
  return res.choices[0].message.content;
};
