import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, FolderOpen, Trash2, Edit2, Download, LogOut, Github, Clock, Code2 } from 'lucide-react';
import Modal from '../components/common/Modal';

const inp = {
  background:'#0d0d1a', border:'1px solid #2a2a45', color:'#d4d4d4',
  padding:'8px 12px', borderRadius:4, fontSize:13, outline:'none',
  width:'100%', fontFamily:'inherit',
};

export default function DashboardPage() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showNew,  setShowNew]  = useState(false);
  const [newName,  setNewName]  = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [renaming, setRenaming] = useState(null);
  const [rname,    setRname]    = useState('');

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    const { data } = await api.post('/projects', { name: newName, description: newDesc });
    setProjects(p => [data, ...p]);
    setShowNew(false); setNewName(''); setNewDesc('');
  };

  const del = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    setProjects(p => p.filter(x => x._id !== id));
  };

  const rename = async () => {
    if (!rname.trim()) return;
    const { data } = await api.patch(`/projects/${renaming}`, { name: rname });
    setProjects(p => p.map(x => x._id === renaming ? data : x));
    setRenaming(null);
  };

  const download = (id, name) => {
    const t = localStorage.getItem('codiee_token');
    fetch(`${process.env.REACT_APP_API_URL}/projects/${id}/download`, {
      headers: { Authorization: `Bearer ${t}` },
    }).then(r => r.blob()).then(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = `${name}.zip`; a.click();
    });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0d0d1a', overflow:'auto' }}>
      {/* Background glow */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 10% 0%, rgba(0,122,204,0.07) 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(138,43,226,0.05) 0%, transparent 50%)',
      }}/>

      {/* Header */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 28px', height:56,
        background:'rgba(22,22,42,0.95)', borderBottom:'1px solid #2a2a45',
        flexShrink:0, backdropFilter:'blur(12px)', position:'relative', zIndex:10,
      }}>
        <img src="/codiee-logo.png" alt="Codiee" style={{ height:32, width:'auto' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {user?.avatarUrl && (
            <img src={user.avatarUrl} alt="" style={{ width:30, height:30, borderRadius:'50%', border:'2px solid #2a2a45' }}/>
          )}
          <span style={{ color:'#8a8aaa', fontSize:13 }}>{user?.username}</span>
          <button onClick={logout} title="Logout" style={{
            color:'#6a6a8a', background:'none', border:'none', cursor:'pointer', padding:4,
            display:'flex', alignItems:'center',
          }} onMouseEnter={e=>e.currentTarget.style.color='#ff6b6b'}
             onMouseLeave={e=>e.currentTarget.style.color='#6a6a8a'}>
            <LogOut size={16}/>
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex:1, padding:'36px 48px', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#e0e0ff', marginBottom:4 }}>Projects</h1>
            <p style={{ color:'#6a6a8a', fontSize:13 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNew(true)} style={{
            display:'flex', alignItems:'center', gap:7,
            background:'linear-gradient(135deg, #007acc 0%, #6a00cc 100%)',
            color:'#fff', border:'none', padding:'8px 18px', borderRadius:6,
            fontSize:13, fontWeight:600, cursor:'pointer',
            boxShadow:'0 4px 20px rgba(0,122,204,.3)',
          }}>
            <Plus size={16}/> New Project
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', paddingTop:80, color:'#6a6a8a' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, paddingTop:100 }}>
            <Code2 size={52} color="#2a2a45"/>
            <p style={{ color:'#6a6a8a', fontSize:15 }}>No projects yet. Create your first one.</p>
            <button onClick={() => setShowNew(true)} style={{
              display:'flex', alignItems:'center', gap:7,
              background:'linear-gradient(135deg, #007acc 0%, #6a00cc 100%)',
              color:'#fff', border:'none', padding:'8px 18px', borderRadius:6,
              fontSize:13, fontWeight:600, cursor:'pointer',
            }}>
              <Plus size={16}/> New Project
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
            {projects.map(p => (
              <div key={p._id}
                onClick={() => navigate(`/project/${p._id}`)}
                style={{
                  background:'rgba(22,22,42,0.9)', border:'1px solid #2a2a45',
                  borderRadius:10, padding:20, cursor:'pointer',
                  transition:'all .2s', position:'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#007acc';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,122,204,.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2a2a45';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                {/* Folder icon + name */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:8,
                    background:'linear-gradient(135deg, rgba(0,122,204,.2) 0%, rgba(106,0,204,.2) 100%)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <FolderOpen size={18} color="#00bfff"/>
                  </div>
                  <span style={{ fontWeight:700, color:'#e0e0ff', fontSize:14, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                    {p.name}
                  </span>
                </div>
                <p style={{ color:'#6a6a8a', fontSize:12, marginBottom:14, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                  {p.description || 'No description'}
                </p>
                <div style={{ display:'flex', gap:12, color:'#4a4a6a', fontSize:11, marginBottom:14 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <Clock size={11}/> {new Date(p.lastOpened).toLocaleDateString()}
                  </span>
                  {p.githubRepo && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, color:'#6a8a6a' }}>
                      <Github size={11}/> {p.githubRepo}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:6, borderTop:'1px solid #1e1e38', paddingTop:12 }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setRenaming(p._id); setRname(p.name); }} title="Rename"
                    style={{ color:'#6a6a8a', background:'none', border:'none', cursor:'pointer', padding:'4px 6px', borderRadius:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#6a6a8a'}>
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => download(p._id, p.name)} title="Download ZIP"
                    style={{ color:'#6a6a8a', background:'none', border:'none', cursor:'pointer', padding:'4px 6px', borderRadius:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#6a6a8a'}>
                    <Download size={14}/>
                  </button>
                  <button onClick={() => del(p._id)} title="Delete"
                    style={{ color:'#6a6a8a', background:'none', border:'none', cursor:'pointer', padding:'4px 6px', borderRadius:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#f14c4c'} onMouseLeave={e=>e.currentTarget.style.color='#6a6a8a'}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNew && (
        <Modal title="New Project" onClose={() => setShowNew(false)} onConfirm={create} confirmLabel="Create">
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input style={inp} placeholder="Project name" value={newName} onChange={e=>setNewName(e.target.value)} autoFocus/>
            <input style={inp} placeholder="Description (optional)" value={newDesc} onChange={e=>setNewDesc(e.target.value)}/>
          </div>
        </Modal>
      )}
      {renaming && (
        <Modal title="Rename Project" onClose={() => setRenaming(null)} onConfirm={rename} confirmLabel="Rename">
          <input style={inp} value={rname} onChange={e=>setRname(e.target.value)} autoFocus/>
        </Modal>
      )}
    </div>
  );
}
