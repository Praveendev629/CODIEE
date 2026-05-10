import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useEditor } from '../../context/EditorContext';
import { useAuth }   from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Save, Terminal, Bot, Home } from 'lucide-react';
import { getLanguageLabel } from '../../utils/languageDetector';

const item = { display:'flex', alignItems:'center', gap:4, padding:'0 8px', height:22, color:'#fff', cursor:'pointer', transition:'background .15s', whiteSpace:'nowrap', borderRadius:2, fontSize:12, background:'none', border:'none', fontFamily:'inherit' };

export default function StatusBar({ onSave }) {
  const { connected }       = useSocket();
  const { state, dispatch } = useEditor();
  const { user }            = useAuth();
  const navigate            = useNavigate();

  const activeTab  = state.openTabs.find(t => t.fileId === state.activeTabId);
  const dirtyCount = state.openTabs.filter(t => t.isDirty).length;

  return (
    <div style={{
      height:22, background:'linear-gradient(90deg, #007acc 0%, #6a00cc 100%)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 6px', flexShrink:0, fontSize:12,
    }}>
      {/* Left */}
      <div style={{ display:'flex', alignItems:'center' }}>
        <button onClick={() => navigate('/')} style={item}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <img src="/favicon.png" alt="" style={{ width:14, height:14, borderRadius:2 }}/>
          Codiee
        </button>

        <div style={{ ...item, color: connected ? '#b3ffec' : '#ffb3b3' }}>
          {connected ? <Wifi size={12}/> : <WifiOff size={12}/>}
          {connected ? 'Live' : 'Offline'}
        </div>

        {dirtyCount > 0 && (
          <button onClick={onSave} style={item}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>
            <Save size={12}/> {dirtyCount} unsaved
          </button>
        )}
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center' }}>
        {activeTab && <span style={item}>{getLanguageLabel(activeTab.language)}</span>}
        <button onClick={() => dispatch({ type:'TOGGLE_TERMINAL' })} style={item} title="Toggle Terminal"
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <Terminal size={12}/>
        </button>
        <button onClick={() => dispatch({ type:'TOGGLE_AI_PANEL' })} style={item} title="Toggle AI Panel"
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <Bot size={12}/>
        </button>
        {user?.avatarUrl && (
          <img src={user.avatarUrl} alt="" style={{ width:16, height:16, borderRadius:'50%', marginRight:4, marginLeft:4 }}/>
        )}
        <span style={item}>{user?.username}</span>
      </div>
    </div>
  );
}
