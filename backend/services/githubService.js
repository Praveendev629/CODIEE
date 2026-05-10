const axios = require('axios');
const GH = 'https://api.github.com';

function client(token) {
  return axios.create({
    baseURL: GH,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

exports.getUser      = (t)          => client(t).get('/user').then(r => r.data);
exports.listRepos    = (t, p=1, pp=30) => client(t).get(`/user/repos?sort=updated&per_page=${pp}&page=${p}`).then(r => r.data);
exports.getRepo      = (t, o, r)    => client(t).get(`/repos/${o}/${r}`).then(r => r.data);
exports.getContents  = (t, o, r, p='') => client(t).get(`/repos/${o}/${r}/contents/${p}`).then(r => r.data);

exports.getFileContent = async (t, o, r, p) => {
  const { data } = await client(t).get(`/repos/${o}/${r}/contents/${p}`);
  const content = data.encoding === 'base64' ? Buffer.from(data.content, 'base64').toString('utf8') : data.content;
  return { content, sha: data.sha };
};

exports.putFile = (t, o, r, p, content, msg, sha=null) =>
  client(t).put(`/repos/${o}/${r}/contents/${p}`, {
    message: msg, content: Buffer.from(content).toString('base64'), ...(sha && { sha }),
  }).then(r => r.data);

exports.createRepo = (t, name, desc='', priv=false) =>
  client(t).post('/user/repos', { name, description: desc, private: priv, auto_init: true }).then(r => r.data);
