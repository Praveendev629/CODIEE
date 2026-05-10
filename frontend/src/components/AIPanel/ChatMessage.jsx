import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isAI = message.role === 'assistant';

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
        const lang  = match?.[1] || '';
        const code  = match?.[2] || part;
        return (
          <div key={i} className={styles.codeBlock}>
            {lang && <span className={styles.codeLang}>{lang}</span>}
            <pre><code>{code}</code></pre>
          </div>
        );
      }
      return part ? <p key={i} className={styles.text}>{part}</p> : null;
    });
  };

  return (
    <div className={`${styles.message} ${isAI ? styles.ai : styles.user}`}>
      <div className={styles.avatar}>
        {isAI ? <Bot size={14} color="#007acc"/> : <User size={14} color="#9d9d9d"/>}
      </div>
      <div className={styles.content}>
        <div className={styles.body}>{renderContent(message.content)}</div>
        {isAI && (
          <button className={styles.copy} onClick={copy}>
            {copied ? <Check size={11} color="#4ec9b0"/> : <Copy size={11}/>}
          </button>
        )}
      </div>
    </div>
  );
}
