import React, { useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditor } from '../../context/EditorContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import EditorToolbar from './EditorToolbar';
import styles from './CodeEditor.module.css';

export default function CodeEditor({ projectId }) {
  const { state, dispatch } = useEditor();
  const { socket }          = useSocket();
  const editorRef           = useRef(null);
  const monacoRef           = useRef(null);
  const changeTimeout       = useRef(null);

  const activeTab = state.openTabs.find(t => t.fileId === state.activeTabId);
  const content   = state.fileContents[state.activeTabId] || '';

  const handleMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Track selected code for AI panel
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      const selected  = editor.getModel()?.getValueInRange(selection) || '';
      dispatch({ type: 'SET_SELECTED_CODE', payload: selected });
    });

    // Ctrl+S save shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (!state.activeTabId) return;
      await api.put(`/files/${projectId}/${state.activeTabId}`, { content: editor.getValue() });
      dispatch({ type: 'MARK_SAVED', payload: state.activeTabId });
    });
  };

  const handleChange = useCallback((value) => {
    if (!state.activeTabId) return;
    dispatch({ type: 'SET_CONTENT', payload: { fileId: state.activeTabId, content: value } });
    clearTimeout(changeTimeout.current);
    changeTimeout.current = setTimeout(() => {
      socket?.emit('code:change', { projectId, fileId: state.activeTabId, content: value });
    }, 200);
  }, [state.activeTabId, socket, projectId]);

  if (!activeTab) return null;

  return (
    <div className={styles.container}>
      <EditorToolbar projectId={projectId} />
      <MonacoEditor
        height="100%"
        language={activeTab.language || 'plaintext'}
        value={content}
        theme={state.theme}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: state.fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12 },
          suggest: { showKeywords: true },
        }}
      />
    </div>
  );
}
