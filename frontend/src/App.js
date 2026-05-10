import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { EditorProvider } from './context/EditorContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import EditorPage         from './pages/EditorPage';
import AuthCallback       from './pages/AuthCallback';
import ProtectedRoute     from './components/common/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/project/:id"   element={
            <ProtectedRoute>
              <SocketProvider>
                <EditorProvider>
                  <EditorPage />
                </EditorProvider>
              </SocketProvider>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
