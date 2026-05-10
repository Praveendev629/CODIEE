import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Files, Bot, GitBranch, Settings } from 'lucide-react';

export default function ActivityBar() {
  const { dispatch } = useEditor();
  const items = [
    { icon:Files,     label:'Explorer', action:()=>dispatch({ type:'TOGGLE_SIDEBAR' }) },
    { icon:Bot,       label:'AI Panel', action:()=>dispatch({ type:'TOGGLE_AI_PANEL' }) },
    { icon:GitBranch, label:'GitHub',   action:()=>{} },
  ];
  const btnStyle = { width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', color:'#858585', borderRadius:4, margin:'2px 0', background:'none', border:'none', cursor:'pointer', transition:'color .2s' };

  return (
    <div style={{ width:48, background:'#1a1a2e', display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 0', borderRight:'1px solid #2a2a45', flexShrink:0 }}>
      {/* App icon — small logo at top */}
      <div style={{ marginBottom:10, marginTop:4 }}>
        <img src="/favicon.png" alt="Codiee" style={{ width:32, height:32, borderRadius:6 }}/>
      </div>

      <div style={{ width:'100%', height:1, background:'#2a2a45', marginBottom:6 }}/>

      {items.map(({ icon:Icon, label, action }) => (
        <button key={label} onClick={action} title={label} style={btnStyle}
          onMouseEnter={e=>e.currentTarget.style.color='#e0e0ff'}
          onMouseLeave={e=>e.currentTarget.style.color='#858585'}>
          <Icon size={20}/>
        </button>
      ))}
      <div style={{ flex:1 }}/>
      <button title="Settings" style={btnStyle}
        onMouseEnter={e=>e.currentTarget.style.color='#e0e0ff'}
        onMouseLeave={e=>e.currentTarget.style.color='#858585'}>
        <Settings size={20}/>
      </button>
    </div>
  );
}
