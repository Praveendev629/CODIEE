import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#9d9d9d',background:'#1e1e1e'}}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
