import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import api from '../../services/api';
import { Bot, Send, Trash2, Code, Wrench, RefreshCw, Sparkles, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import styles from './AIPanel.module.css';

const ACTIONS = [
  { id: 'chat',     label: 'Chat',     icon: Bot },
  { id: 'explain',  label: 'Explain',  icon: Code },
  { id: 'fix',      label: 'Fix',      icon: Wrench },
  { id: 'refactor', label: 'Refactor', icon: RefreshCw },
  { id: 'generate', label: 'Generate', icon: Sparkles },
];

export default function AIPanel({ projectId }) {
  const { state, dispatch }     = useEditor();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [action,   setAction]   = useState('chat');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/ai/history/${projectId}`).then(r => setMessages(r.data)).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() && !state.selectedCode) return;
    const userMsg = { role: 'user', content: input, codeSnippet: state.selectedCode, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    try {
      const { data } = await api.post(`/ai/chat/${projectId}`, {
        message: input, codeSnippet: state.selectedCode, action,
      });
      setMessages(m => [...m, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + (err.response?.data?.message || err.message), timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const clear = async () => {
    await api.delete(`/ai/history/${projectId}`);
    setMessages([]);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}><Bot size={16} color="#007acc" /><span>AI Assistant</span></div>
        <div className={styles.headerRight}>
          <button onClick={clear} title="Clear history"><Trash2 size={14}/></button>
          <button onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })} title="Close"><X size={14}/></button>
        </div>
      </div>
      <div className={styles.actions}>
        {ACTIONS.map(a => (
          <button key={a.id} className={`${styles.actionBtn} ${action === a.id ? styles.actionActive : ''}`} onClick={() => setAction(a.id)}>
            <a.icon size={12}/> {a.label}
          </button>
        ))}
      </div>
      {state.selectedCode && (
        <div className={styles.selectionHint}><Code size={12}/> Code selected ({state.selectedCode.split('\n').length} lines)</div>
      )}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}><Bot size={32} color="#424242"/><p>Ask me anything about your code.</p></div>
        )}
        {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
        {loading && <div className={styles.thinking}><div className={styles.dot}/><div className={styles.dot}/><div className={styles.dot}/></div>}
        <div ref={bottomRef}/>
      </div>
      <div className={styles.inputArea}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything... (Enter to send)" rows={3} className={styles.textarea}/>
        <button onClick={send} disabled={loading} className={styles.sendBtn}><Send size={16}/></button>
      </div>
    </div>
  );
}
