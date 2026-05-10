import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { getFileIconInfo } from '../../utils/fileIcons';
import { File, X } from 'lucide-react';

export default function EditorTabs() {
  const { state, dispatch } = useEditor();
  const { openTabs, activeTabId } = state;

  if (!openTabs.length) return <div style={{height:35,background:'#252526',borderBottom:'1px solid #3c3c3c'}}/>;

  return (
    <div style={{display:'flex',height:35,background:'#252526',borderBottom:'1px solid #3c3c3c',overflowX:'auto',flexShrink:0}}>
      {openTabs.map(tab => {
        const { color } = getFileIconInfo(tab.name);
        const active    = tab.fileId === activeTabId;
        return (
          <div key={tab.fileId} onClick={()=>dispatch({type:'SET_ACTIVE_TAB',payload:tab.fileId})}
            style={{display:'flex',alignItems:'center',gap:6,padding:'0 14px',minWidth:120,maxWidth:180,cursor:'pointer',flexShrink:0,color:active?'#d4d4d4':'#9d9d9d',fontSize:13,borderRight:'1px solid #3c3c3c',background:active?'#1e1e1e':'#2d2d30',borderTop:active?'1px solid #007acc':'1px solid transparent',transition:'background .15s'}}>
            <File size={13} color={color}/>
            <span style={{flex:1,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{tab.name}</span>
            {tab.isDirty && <span style={{width:7,height:7,borderRadius:'50%',background:'#d4d4d4',flexShrink:0}}/>}
            <button onClick={e=>{e.stopPropagation();dispatch({type:'CLOSE_TAB',payload:tab.fileId});}}
              style={{color:'#6a6a6a',borderRadius:3,padding:2,background:'none',border:'none',cursor:'pointer',flexShrink:0}}
              onMouseEnter={e=>e.currentTarget.style.color='#d4d4d4'} onMouseLeave={e=>e.currentTarget.style.color='#6a6a6a'}>
              <X size={12}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}
