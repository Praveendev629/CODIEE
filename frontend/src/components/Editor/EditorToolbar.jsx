import React from 'react';
import { useEditor } from '../../context/EditorContext';
import api from '../../services/api';
import { Save, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';
import styles from './EditorToolbar.module.css';
import { getLanguageLabel } from '../../utils/languageDetector';

export default function EditorToolbar({ projectId }) {
  const { state, dispatch } = useEditor();
  const activeTab = state.openTabs.find(t => t.fileId === state.activeTabId);

  const save = async () => {
    if (!activeTab) return;
    const content = state.fileContents[activeTab.fileId];
    await api.put(`/files/${projectId}/${activeTab.fileId}`, { content });
    dispatch({ type: 'MARK_SAVED', payload: activeTab.fileId });
  };

  return (
    <div className={styles.toolbar}>
      <span className={styles.path}>{activeTab?.path || ''}</span>
      <div className={styles.right}>
        {activeTab && <span className={styles.lang}>{getLanguageLabel(activeTab.language)}</span>}
        <button onClick={save} className={styles.btn} title="Save (Ctrl+S)"><Save size={14}/></button>
        <button onClick={() => dispatch({ type: 'SET_FONT_SIZE', payload: Math.max(10, state.fontSize - 1) })} className={styles.btn}><ZoomOut size={14}/></button>
        <button onClick={() => dispatch({ type: 'SET_FONT_SIZE', payload: Math.min(24, state.fontSize + 1) })} className={styles.btn}><ZoomIn size={14}/></button>
        <button onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'vs-dark' ? 'light' : 'vs-dark' })} className={styles.btn}>
          {state.theme === 'vs-dark' ? <Sun size={14}/> : <Moon size={14}/>}
        </button>
      </div>
    </div>
  );
}
