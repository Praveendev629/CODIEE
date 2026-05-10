import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
export default function AuthCallback() {
  const [params] = useSearchParams(); const { login } = useAuth(); const navigate = useNavigate();
  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }
    localStorage.setItem('codiee_token', token);
    api.get('/auth/me').then(r => { login(token, r.data.user); navigate('/'); }).catch(() => navigate('/login'));
  }, []);
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#9d9d9d',background:'#1e1e1e'}}>Signing in...</div>;
}
