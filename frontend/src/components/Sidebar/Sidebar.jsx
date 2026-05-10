import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import api from '../../services/api';
import FileExplorer from './FileExplorer';
import { FilePlus, FolderPlus, Upload } from 'lucide-react';
import Modal from '../common/Modal';

const inp = {background:'#1e1e1e',border:'1px solid #3c3c3c',color:'#d4d4d4',padding:'8px 12px',borderRadius:4,fontSize:13,outline:'none',width:'100%',fontFamily:'inherit'};

export default function Sidebar({ projectId }) {
  const { state, dispatch } = useEditor();
  const [showFile,  setShowFile]  = useState(false);
  const [showFolder,setShowFolder]= useState(false);
  const [fname,     setFname]     = useState('');
  const [folder,    setFolder]    = useState('');

  const createFile = async () => {
    if (!fname.trim()) return;
    const { data } = await api.post(`/files/${projectId}`, { name:fname });
    dispatch({ type:'ADD_FILE', payload:data }); setShowFile(false); setFname('');
  };

  const createFolder = async () => {
    if (!folder.trim()) return;
    await api.post(`/files/${projectId}/folder`, { name:folder }); setShowFolder(false); setFolder('');
  };

  const upload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      r.onload = async (ev) => {
        const { data } = await api.post(`/files/${projectId}`, { name:file.name, content:ev.target.result });
        dispatch({ type:'ADD_FILE', payload:data });
      };
      r.readAsText(file);
    });
  };

  return (
    <div style={{width:240,background:'#252526',borderRight:'1px solid #3c3c3c',display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',height:35,borderBottom:'1px solid #3c3c3c',flexShrink:0}}>
        <span style={{fontSize:11,fontWeight:700,color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>{state.project?.name||'EXPLORER'}</span>
        <div style={{display:'flex',gap:4}}>
          <button onClick={()=>setShowFile(true)} title="New File" style={{color:'#9d9d9d',padding:3,background:'none',border:'none',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#9d9d9d'}><FilePlus size={15}/></button>
          <button onClick={()=>setShowFolder(true)} title="New Folder" style={{color:'#9d9d9d',padding:3,background:'none',border:'none',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#9d9d9d'}><FolderPlus size={15}/></button>
          <label title="Upload files" style={{color:'#9d9d9d',padding:3,cursor:'pointer',display:'flex',alignItems:'center'}} onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#9d9d9d'}>
            <Upload size={15}/><input type="file" multiple onChange={upload} style={{display:'none'}}/>
          </label>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}><FileExplorer projectId={projectId}/></div>
      {showFile   && <Modal title="New File"   onClose={()=>setShowFile(false)}   onConfirm={createFile}   confirmLabel="Create"><input style={inp} value={fname}  onChange={e=>setFname(e.target.value)}  placeholder="filename.js" autoFocus onKeyDown={e=>e.key==='Enter'&&createFile()}/></Modal>}
      {showFolder && <Modal title="New Folder" onClose={()=>setShowFolder(false)} onConfirm={createFolder} confirmLabel="Create"><input style={inp} value={folder} onChange={e=>setFolder(e.target.value)} placeholder="folder-name" autoFocus onKeyDown={e=>e.key==='Enter'&&createFolder()}/></Modal>}
    </div>
  );
}
