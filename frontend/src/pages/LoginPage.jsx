import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Github, Eye, EyeOff } from 'lucide-react';

const inp = {
  background:'#1e1e1e', border:'1px solid #3c3c3c', color:'#d4d4d4',
  padding:'9px 12px', borderRadius:4, fontSize:13, outline:'none',
  width:'100%', fontFamily:'inherit',
};

export default function LoginPage() {
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({ username:'', email:'', password:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#0d0d1a', padding:20,
    }}>
      {/* Subtle gradient background */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 20% 50%, rgba(0,122,204,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(138,43,226,0.06) 0%, transparent 50%)',
      }}/>

      <div style={{
        width:'100%', maxWidth:420, background:'#16162a',
        border:'1px solid #2a2a45', borderRadius:12, padding:40,
        position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img
            src="/codiee-logo.png"
            alt="Codiee"
            style={{ width:220, height:'auto', display:'inline-block' }}
          />
        </div>
        <p style={{ color:'#6a6a8a', fontSize:13, textAlign:'center', marginBottom:28 }}>
          Cloud IDE with AI superpowers
        </p>

        {/* Tab switcher */}
        <div style={{ display:'flex', borderBottom:'1px solid #2a2a45', marginBottom:24 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex:1, padding:'10px', background:'none', border:'none', cursor:'pointer',
              color: mode===m ? '#00bfff' : '#6a6a8a', fontSize:13, fontFamily:'inherit',
              borderBottom: mode===m ? '2px solid #00bfff' : '2px solid transparent',
              transition: 'all .2s',
            }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background:'rgba(241,76,76,.12)', border:'1px solid rgba(241,76,76,.4)',
            color:'#ff6b6b', padding:'10px 12px', borderRadius:6, marginBottom:16, fontSize:13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {mode === 'register' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ color:'#8a8aaa', fontSize:12, fontWeight:500 }}>Username</label>
              <input style={{...inp, background:'#0d0d1a', border:'1px solid #2a2a45'}}
                type="text" value={form.username}
                onChange={e=>setForm({...form,username:e.target.value})}
                required placeholder="johndoe" autoFocus/>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ color:'#8a8aaa', fontSize:12, fontWeight:500 }}>Email</label>
            <input style={{...inp, background:'#0d0d1a', border:'1px solid #2a2a45'}}
              type="email" value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              required placeholder="john@example.com"/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ color:'#8a8aaa', fontSize:12, fontWeight:500 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input style={{...inp, background:'#0d0d1a', border:'1px solid #2a2a45', paddingRight:40}}
                type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})}
                required placeholder="••••••••"/>
              <button type="button" onClick={() => setShowPwd(p=>!p)} style={{
                position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                color:'#6a6a8a', background:'none', border:'none', cursor:'pointer',
              }}>
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            background:'linear-gradient(135deg, #007acc 0%, #6a00cc 100%)',
            color:'#fff', border:'none', padding:'11px', borderRadius:6,
            fontSize:13, fontWeight:600, cursor:'pointer', marginTop:4,
            opacity: loading ? .6 : 1, transition:'opacity .2s',
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'#3a3a5a', fontSize:12 }}>
          <div style={{ flex:1, height:1, background:'#2a2a45' }}/> or <div style={{ flex:1, height:1, background:'#2a2a45' }}/>
        </div>

        <a href={`${(process.env.REACT_APP_API_URL||'http://localhost:5000/api').replace('/api','')}/api/auth/github`}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            background:'#161b22', color:'#d4d4d4', border:'1px solid #2a2a45',
            padding:'10px', borderRadius:6, fontSize:13, fontWeight:500, textDecoration:'none',
            transition:'background .2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='#21262d'}
          onMouseLeave={e=>e.currentTarget.style.background='#161b22'}>
          <Github size={18}/> Continue with GitHub
        </a>
      </div>
    </div>
  );
}
