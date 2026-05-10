import React, { useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor } from '../context/EditorContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import ActivityBar from '../components/Sidebar/ActivityBar';
import Sidebar     from '../components/Sidebar/Sidebar';
import EditorTabs  from '../components/Editor/EditorTabs';
import CodeEditor  from '../components/Editor/CodeEditor';
import AIPanel     from '../components/AIPanel/AIPanel';
import Terminal    from '../components/Terminal/Terminal';
import StatusBar   from '../components/StatusBar/StatusBar';

export default function EditorPage() {
  const { id }              = useParams();
  const { state, dispatch } = useEditor();
  const { socket }          = useSocket();
  const autoSaveRef         = useRef(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(({ data }) => {
      dispatch({ type:'SET_PROJECT', payload:data.project });
      dispatch({ type:'SET_FILES',   payload:data.files });
    });
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join:project', id);
    socket.on('code:change', ({ fileId, content }) => dispatch({ type:'SET_CONTENT', payload:{ fileId, content, isDirty:false } }));
    socket.on('file:created', f => dispatch({ type:'ADD_FILE', payload:f }));
    socket.on('file:deleted', ({ fileId }) => dispatch({ type:'REMOVE_FILE', payload:fileId }));
    return () => { socket.emit('leave:project', id); socket.off('code:change'); socket.off('file:created'); socket.off('file:deleted'); };
  }, [socket, id]);

  const saveAll = useCallback(async () => {
    for (const t of state.openTabs.filter(t=>t.isDirty)) {
      const c = state.fileContents[t.fileId];
      if (c===undefined) continue;
      await api.put(`/files/${id}/${t.fileId}`, { content:c });
      dispatch({ type:'MARK_SAVED', payload:t.fileId });
    }
  }, [state.openTabs, state.fileContents, id]);

  useEffect(() => {
    autoSaveRef.current = setInterval(saveAll, 5000);
    return () => clearInterval(autoSaveRef.current);
  }, [saveAll]);

  return (
    <div style={{display:'flex',height:'100vh',background:'#1e1e1e',overflow:'hidden'}}>
      <ActivityBar/>
      {state.sidebarOpen && <Sidebar projectId={id}/>}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <EditorTabs/>
        <div style={{flex:1,display:'flex',overflow:'hidden'}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
            {state.activeTabId ? <CodeEditor projectId={id}/> : (
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'#1e1e1e',color:'#3c3c3c',flexDirection:'column',gap:8}}>
                <div style={{fontSize:32,fontWeight:300,color:'#333'}}>Codiee</div>
                <div style={{fontSize:13}}>Open a file from the explorer to start editing</div>
              </div>
            )}
          </div>
          {state.aiPanelOpen && <AIPanel projectId={id}/>}
        </div>
        {state.terminalOpen && <Terminal/>}
        <StatusBar projectId={id} onSave={saveAll}/>
      </div>
    </div>
  );
}
