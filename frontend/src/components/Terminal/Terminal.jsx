import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import styles from './Terminal.module.css';

export default function Terminal() {
  const { dispatch } = useEditor();
  const [lines,   setLines]   = useState([{ type: 'info', text: 'Codiee Terminal — Output console ready.' }]);
  const [input,   setInput]   = useState('');
  const [history, setHistory] = useState([]);
  const [hIdx,    setHIdx]    = useState(-1);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  const execute = (cmd) => {
    if (!cmd.trim()) return;
    setHistory(h => [cmd, ...h]); setHIdx(-1);
    setLines(l => [...l, { type: 'input', text: `$ ${cmd}` }]);
    setInput('');
    const responses = {
      help: 'Available: help, clear, echo, date, ls, node --version, npm --version',
      clear: '__CLEAR__',
      date: new Date().toString(),
      ls: 'src/  public/  package.json  README.md',
      'node --version': 'v20.11.0',
      'npm --version': '10.2.4',
    };
    const out = cmd.startsWith('echo ') ? cmd.slice(5)
      : responses[cmd.trim()] || `Command not found: ${cmd.trim()}. Try 'help'.`;
    if (out === '__CLEAR__') { setLines([]); return; }
    setLines(l => [...l, { type: 'output', text: out }]);
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.headerLeft}><TerminalIcon size={13}/><span>Terminal</span></div>
        <button onClick={() => dispatch({ type: 'TOGGLE_TERMINAL' })}><X size={14}/></button>
      </div>
      <div className={styles.body} ref={bodyRef}>
        {lines.map((l, i) => <div key={i} className={`${styles.line} ${styles[l.type]}`}>{l.text}</div>)}
      </div>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>$</span>
        <input className={styles.input} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') execute(input);
            if (e.key === 'ArrowUp') { const n = Math.min(hIdx+1,history.length-1); setHIdx(n); setInput(history[n]||''); }
            if (e.key === 'ArrowDown') { const n = Math.max(hIdx-1,-1); setHIdx(n); setInput(n===-1?'':history[n]); }
          }}
          placeholder="Type a command..." spellCheck={false} autoComplete="off"/>
      </div>
    </div>
  );
}
