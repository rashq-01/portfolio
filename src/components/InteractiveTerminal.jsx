import { initAudio, playTickSound } from "../utils/audio";
import React, { useState, useRef, useEffect } from 'react';

const commandsList = {
  sudo: 'rajesh is not in the sudoers file. This incident will be reported to Santa Claus.',
  date: new Date().toString(),
  whoami: 'rajesh (guest user)',
  help: 'Available commands:\n- about     : Who is Rajesh?\n- skills    : Tech stack & tools\n- projects  : Featured work\n- contact   : How to reach me\n- clear     : Clear terminal output\n- date      : Current system date\n- sudo      : Superuser access\n- echo      : Repeat after me\n- whoami    : Print current user\n- status    : System health check\n- neofetch  : System information',
  about: 'Rajesh Pandit - Backend Engineer.\nI build distributed infrastructure, real-time platforms, and APIs engineered to handle massive concurrency. I think in systems — not just code.',
  skills: 'Backend: Node.js, Python, C++, Go\nDatabases: MongoDB, PostgreSQL, Redis\nArchitecture: Microservices, WebSockets, Pub/Sub\nCloud: AWS, Docker, Kubernetes',
  projects: '1. NexusChat - Real-time scalable messaging system\n2. LibraTech - Advanced library management API\n3. AirBNB Clone - Full-stack booking platform\n4. CodeJudge - Auto-evaluating competitive platform',
  contact: 'Email: rajesh@example.com\nGitHub: https://github.com/rashq-01\nLinkedIn: https://linkedin.com/in/rashq\nX: @rashq_01',
  status: 'System checks:\n[OK] Database connection active\n[OK] Redis cache operational\n[OK] API endpoints stable\n[OK] Message broker running\n\nAll systems operational. Uptime: 99.99%',
  neofetch: '       .---.\n      /     \\\n     \\.@-@./\n     /`\\_/`\\\n    //  _  \\\\\n   | \\     / |\n  /`\\_`>  <_/`\\\n  \\__/\\\'---\\\'\\__/\n\nOS: Kali Linux x86_64\nHost: Rajesh-Server\nKernel: 6.8.11-amd64\nUptime: 24 days, 7 hours\nPackages: 2408 (dpkg)\nShell: bash 5.2.21\nTerminal: Web Term'
};

export default function InteractiveTerminal() {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Type "help" to see available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingOutput, setTypingOutput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, typingOutput]);

  const handleKeyDown = (e) => {
    initAudio();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex < cmdHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const availableCmds = Object.keys(commandsList).concat(['clear', 'echo']);
      const match = availableCmds.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  const handleCommand = (e) => {
    e.preventDefault();
    if (isTyping) return;
    
    const fullCmd = input.trim();
    if (!fullCmd) return;
    
    setCmdHistory(prev => [...prev, fullCmd]);
    setHistoryIndex(-1);

    const args = fullCmd.split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    let responseText = '';
    if (cmd === 'echo') {
      responseText = args.slice(1).join(' ');
    } else if (cmd === 'date') {
      responseText = new Date().toString();
    } else if (commandsList[cmd]) {
      responseText = commandsList[cmd];
    } else {
      responseText = `bash: ${cmd}: command not found`;
    }

    setHistory(prev => [...prev, { type: 'input', text: fullCmd }]);
    setInput('');
    setIsTyping(true);
    setTypingOutput('');

    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      setTypingOutput(responseText.slice(0, i + 1));
      if (responseText[i] !== ' ' && responseText[i] !== '\n') {
        playTickSound();
      }
      i++;
      if (i >= responseText.length) {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        setHistory(prev => [...prev, { type: 'output', text: responseText }]);
        setTypingOutput('');
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    }, 15);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  return (
    <div className="h-term" onClick={() => { initAudio(); !isTyping && inputRef.current?.focus(); }}>
      <div className="t-bar">
        <div className="td td1"></div>
        <div className="td td2"></div>
        <div className="td td3"></div>
        <span className="t-ttl">bash &mdash; rajesh@dev:~</span>
      </div>
      <div className="t-body" ref={containerRef} style={{ overflowY: 'auto', overflowX: 'hidden', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
        {history.map((line, i) => (
          <div key={i} style={{ marginBottom: '4px', width: '100%', textAlign: 'left' }}>
            {line.type === 'input' ? (
              <span>
                <span className="t-ps"><span className="t-us">rajesh</span><span className="t-at">@</span><span className="t-ht">kali</span><span className="t-at">:~$ </span></span>
                <span className="t-tx">{line.text}</span>
              </span>
            ) : (
              <span className="t-tx" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#a3b8cc' }}>{line.text}</span>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div style={{ marginBottom: '4px', width: '100%', textAlign: 'left' }}>
            <span className="t-tx" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#a3b8cc' }}>{typingOutput}<span style={{animation: 'blink 1s step-end infinite'}}>_</span></span>
          </div>
        )}
        
        {!isTyping && (
          <form onSubmit={handleCommand} style={{ display: 'flex', marginTop: '4px', width: '100%', alignItems: 'center', textAlign: 'left' }}>
            <span className="t-ps"><span className="t-us">rajesh</span><span className="t-at">@</span><span className="t-ht">kali</span><span className="t-at">:~$ </span></span>
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '13px',
                outline: 'none',
                flex: 1,
                marginLeft: '4px',
                textAlign: 'left'
              }}
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        )}
      </div>
    </div>
  );
}
