import React, { createContext, useContext, useReducer, useCallback } from 'react';
const EditorContext = createContext(null);
const init = { project:null, files:[], openTabs:[], activeTabId:null, fileContents:{}, selectedCode:'', theme:'vs-dark', fontSize:14, aiPanelOpen:true, terminalOpen:true, sidebarOpen:true };
function reducer(s, a) {
  switch(a.type) {
    case 'SET_PROJECT':  return {...s, project: a.payload};
    case 'SET_FILES':    return {...s, files: a.payload};
    case 'OPEN_TAB': {
      const e = s.openTabs.find(t => t.fileId === a.payload.fileId);
      if (e) return {...s, activeTabId: a.payload.fileId};
      return {...s, openTabs:[...s.openTabs, a.payload], activeTabId: a.payload.fileId};
    }
    case 'CLOSE_TAB': {
      const t = s.openTabs.filter(t => t.fileId !== a.payload);
      return {...s, openTabs:t, activeTabId: t.length > 0 ? t[t.length-1].fileId : null};
    }
    case 'SET_ACTIVE_TAB': return {...s, activeTabId: a.payload};
    case 'SET_CONTENT':    return {...s, fileContents:{...s.fileContents,[a.payload.fileId]:a.payload.content}, openTabs:s.openTabs.map(t => t.fileId===a.payload.fileId ? {...t,isDirty:a.payload.isDirty!==false} : t)};
    case 'MARK_SAVED':     return {...s, openTabs:s.openTabs.map(t => t.fileId===a.payload ? {...t,isDirty:false} : t)};
    case 'ADD_FILE':       return {...s, files:[...s.files, a.payload]};
    case 'REMOVE_FILE':    return {...s, files:s.files.filter(f=>f._id!==a.payload), openTabs:s.openTabs.filter(t=>t.fileId!==a.payload), activeTabId:s.activeTabId===a.payload?(s.openTabs.find(t=>t.fileId!==a.payload)?.fileId||null):s.activeTabId};
    case 'SET_SELECTED_CODE': return {...s, selectedCode:a.payload};
    case 'TOGGLE_AI_PANEL':   return {...s, aiPanelOpen:!s.aiPanelOpen};
    case 'TOGGLE_TERMINAL':   return {...s, terminalOpen:!s.terminalOpen};
    case 'TOGGLE_SIDEBAR':    return {...s, sidebarOpen:!s.sidebarOpen};
    case 'SET_THEME':         return {...s, theme:a.payload};
    case 'SET_FONT_SIZE':     return {...s, fontSize:a.payload};
    default: return s;
  }
}
export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);
  const openFile = useCallback((file, content='') => {
    dispatch({ type:'OPEN_TAB', payload:{ fileId:file._id, name:file.name, path:file.path, language:file.language, isDirty:false } });
    dispatch({ type:'SET_CONTENT', payload:{ fileId:file._id, content, isDirty:false } });
  }, []);
  return <EditorContext.Provider value={{ state, dispatch, openFile }}>{children}</EditorContext.Provider>;
}
export const useEditor = () => useContext(EditorContext);
