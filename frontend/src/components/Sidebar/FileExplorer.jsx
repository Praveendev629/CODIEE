import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import api from '../../services/api';
import { getFileIconInfo } from '../../utils/fileIcons';
import { File, Folder, FolderOpen, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';
import Modal from '../common/Modal';

const inp = {background:'#1e1e1e',border:'1px solid #3c3c3c',color:'#d4d4d4',padding:'8px 12px',borderRadius:4,fontSize:13,outline:'none',width:'100%',fontFamily:'inherit'};

export default function FileExplorer({ projectId }) {
  const { state, dispatch, openFile } = useEditor();
  const [collapsed, setCollapsed]     = useState({});
  const [renaming,  setRenaming]      = useState(null);
  const [rname,     setRname]         = useState('');

  const openF = async (file) => {
    if (state.fileContents[file._id] !== undefined) {
      dispatch({ type:'OPEN_TAB', payload:{ fileId:file._id, name:file.name, path:file.path, language:file.language, isDirty:false } });
      dispatch({ type:'SET_ACTIVE_TAB', payload:file._id });
      return;
    }
    const { data } = await api.get(`/files/${projectId}/${file._id}`);
    openFile(data, data.content);
  };

  const del = async (e, file) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    await api.delete(`/files/${projectId}/${file._id}`);
    dispatch({ type:'REMOVE_FILE', payload:file._id });
  };

  const rename = async () => {
    const { data } = await api.put(`/files/${projectId}/${renaming._id}`, { name:rname });
    dispatch({ type:'SET_FILES', payload:state.files.map(f=>f._id===renaming._id?data:f) });
    setRenaming(null);
  };

  const rootFiles = state.files.filter(f=>f.folderPath==='/');
  const folders   = state.project?.folders || [];

  const rowStyle = (active) => ({
    display:'flex',alignItems:'center',gap:6,padding:'3px 12px 3px 16px',cursor:'pointer',
    color:'#d4d4d4',fontSize:13,background:active?'#094771':'transparent',position:'relative'
  });

  return (
    <div>
      {rootFiles.map(f => <FileItem key={f._id} file={f} active={state.activeTabId===f._id} onClick={()=>openF(f)} onDelete={e=>del(e,f)} onRename={()=>{setRenaming(f);setRname(f.name);}}/>)}
      {folders.map(folder => {
        const ff = state.files.filter(f=>f.folderPath===folder.path);
        const open = !collapsed[folder.path];
        return (
          <div key={folder.path}>
            <div onClick={()=>setCollapsed(c=>({...c,[folder.path]:!c[folder.path]}))} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 12px',cursor:'pointer',color:'#d4d4d4',fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background='#2d2d30'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {open?<ChevronDown size={14}/>:<ChevronRight size={14}/>}
              {open?<FolderOpen size={14} color="#dcb67a"/>:<Folder size={14} color="#dcb67a"/>}
              <span>{folder.name}</span>
            </div>
            {open && ff.map(f=>(
              <div key={f._id} style={{paddingLeft:16}}>
                <FileItem file={f} active={state.activeTabId===f._id} onClick={()=>openF(f)} onDelete={e=>del(e,f)} onRename={()=>{setRenaming(f);setRname(f.name);}}/>
              </div>
            ))}
          </div>
        );
      })}
      {state.files.length === 0 && <div style={{padding:16,color:'#6a6a6a',fontSize:12,textAlign:'center'}}>No files yet</div>}
      {renaming && <Modal title="Rename File" onClose={()=>setRenaming(null)} onConfirm={rename} confirmLabel="Rename"><input style={inp} value={rname} onChange={e=>setRname(e.target.value)} autoFocus/></Modal>}
    </div>
  );
}

function FileItem({ file, active, onClick, onDelete, onRename }) {
  const [h, setH] = useState(false);
  const { color } = getFileIconInfo(file.name);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:'flex',alignItems:'center',gap:6,padding:'3px 12px 3px 16px',cursor:'pointer',color:'#d4d4d4',fontSize:13,background:active?'#094771':h?'#2d2d30':'transparent'}}>
      <File size={14} color={color}/>
      <span style={{flex:1,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{file.name}</span>
      {h && (
        <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
          <button onClick={onRename} style={{color:'#9d9d9d',background:'none',border:'none',cursor:'pointer',padding:2}}><Edit2 size={12}/></button>
          <button onClick={onDelete} style={{color:'#9d9d9d',background:'none',border:'none',cursor:'pointer',padding:2}}><Trash2 size={12}/></button>
        </div>
      )}
    </div>
  );
}
