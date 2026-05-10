const MAP = {
  js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',
  py:'python',rb:'ruby',go:'go',rs:'rust',java:'java',cs:'csharp',
  cpp:'cpp',c:'c',h:'cpp',html:'html',htm:'html',css:'css',scss:'scss',
  less:'less',json:'json',md:'markdown',yaml:'yaml',yml:'yaml',
  sh:'shell',bash:'shell',sql:'sql',php:'php',swift:'swift',kt:'kotlin',
  xml:'xml',toml:'ini',
};
exports.detectLanguage = (name) => {
  if (name.toLowerCase() === 'dockerfile') return 'dockerfile';
  return MAP[name.split('.').pop().toLowerCase()] || 'plaintext';
};
