import { initAudio, playTickSound } from "../utils/audio";
import React, { useState, useRef, useEffect } from 'react';

const commandsList = {
  sudo: 'rajesh is not in the sudoers file. This incident will be reported to Santa Claus.',
  date: new Date().toString(),
  whoami: 'rajesh (root access denied)',
  help: 'Available commands:\n- about     : Who is Rajesh?\n- skills    : Tech stack & tools\n- projects  : Featured work\n- contact   : How to reach me\n- email     : Display direct email\n- clear     : Clear terminal output\n- date      : Current system date\n- sudo      : Superuser access\n- echo      : Repeat after me\n- whoami    : Print current user\n- status    : System health check\n- deploy    : [LIVE] Deploy infrastructure\n- nmap      : [LIVE] Scan network ports\n- neofetch  : System information\n- ifconfig  : Network interfaces\n- matrix    : The Matrix has you...\n- docker    : Container ASCII\n- architecture: System Design ASCII\n- database  : Database ASCII\n- server    : Server rack ASCII',
  about: 'Rajesh Pandit - Backend Engineer.\nI build distributed infrastructure, real-time platforms, and APIs engineered to handle massive concurrency. I think in systems — not just code.',
  skills: 'Backend: Node.js, Python, C++, Go\nDatabases: MongoDB, PostgreSQL, Redis\nArchitecture: Microservices, WebSockets, Pub/Sub\nCloud: AWS, Docker, Kubernetes',
  projects: '1. NexusChat - Real-time scalable messaging system\n2. LibraTech - Advanced library management API\n3. AirBNB Clone - Full-stack booking platform\n4. CodeJudge - Auto-evaluating competitive platform',
  contact: 'Email: rashq122@gmail.com\nPhone: +977 98XXXXXXXX\nLocation: Birgunj, Nepal\nGitHub: https://github.com/rashq-01\nLinkedIn: https://linkedin.com/in/rashq\nLeetCode: https://leetcode.com/u/rashq_01/\nX: https://x.com/rashq_01\nFacebook: https://facebook.com/rashq0\nInstagram: https://instagram.com/rashq_01',
  email: 'rashq122@gmail.com',
  matrix: 'Wake up, Rajesh...\nThe Matrix has you...\nFollow the white rabbit.\nKnock, knock, Neo.',
  ifconfig: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::215:5dff:fe00:1234  prefixlen 64  scopeid 0x20<link>\n        RX packets 1450012  bytes 8452140 (8.4 MB)\n        TX packets 8541012  bytes 105423140 (105.4 MB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        RX packets 24102  bytes 2400120 (2.4 MB)\n        TX packets 24102  bytes 2400120 (2.4 MB)',
  status: 'System checks:\n[OK] Database connection active\n[OK] Redis cache operational\n[OK] API endpoints stable\n[OK] Message broker running\n\nAll systems operational. Uptime: 99.99%',
  neofetch: '       .---.\n      /     \\\n     \\.@-@./\n     /`\\_/`\\\n    //  _  \\\\\n   | \\     / |\n  /`\\_`>  <_/`\\\n  \\__/\\\'---\\\'\\__/\n\nOS: Kali Linux x86_64\nHost: Rajesh-Server\nKernel: 6.8.11-amd64\nUptime: 24 days, 7 hours\nPackages: 2408 (dpkg)\nShell: bash 5.2.21\nTerminal: Web Term',
  banner: ' ____        _           _\n|  _ \\ __ _ (_) ___  ___| |__\n| |_) / _` || |/ _ \\/ __| \'_ \\\n|  _ < (_| || |  __/\\__ \\ | | |\n|_| \\_\\__,_|/ |\\___||___/_| |_|\n          |__/',
  server: '  [=====]  [=====]  [=====]\n  [=====]  [=====]  [=====]\n  [  .  ]  [  .  ]  [  .  ]\n  [=====]  [=====]  [=====]',
  docker: '                        ##         .\n                  ## ## ##        ==\n               ## ## ## ## ##    ===\n           /"""""""""""""""""\\___/ ===\n      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~~ ~ /  ===- ~~~\n           \\______ o           __/\n             \\    \\         __/\n              \\____\\_______/',
  architecture: '     [ Client ]\n         |\n         v\n [ Load Balancer ]\n    /         \\\n   v           v\n [API 1]     [API 2]\n   \\           /\n    v         v\n  [ Redis Cache ]\n         |\n         v\n   [ PostgreSQL ]',
  database: '      ___\n    / ___ \\\n  | /   \\ |\n  | \\___/ |\n  |       |\n  | \\___/ |\n  |       |\n   \\_____/ '
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

    if (cmd === 'deploy') {
      setHistory(prev => [...prev, { type: 'input', text: fullCmd }]);
      setInput('');
      setIsTyping(true);
      setTypingOutput('');

      const steps = [
        "Initializing deployment sequence...",
        "Building Docker image 'rashq/backend:v2.4'...",
        "Pushing to container registry... [||||||||||] 100%",
        "Applying Kubernetes manifests...",
        "Waiting for pods to be ready (3/3)...",
        "Running database migrations...",
        "Deployment successful! Traffic routed."
      ];
      let stepIdx = 0;
      
      typingIntervalRef.current = setInterval(() => {
        if (stepIdx < steps.length) {
          playTickSound();
          setHistory(prev => [...prev, { type: 'output', text: steps[stepIdx] }]);
          stepIdx++;
        } else {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
          setTimeout(() => inputRef.current?.focus(), 10);
        }
      }, 700);
      return;
    }

    if (cmd === 'nmap') {
      const target = args[1] || '127.0.0.1';
      setHistory(prev => [...prev, { type: 'input', text: fullCmd }]);
      setInput('');
      setIsTyping(true);
      setTypingOutput('');
      
      const steps = [
        `Starting Nmap 7.92 at ${new Date().toISOString()}`,
        `Nmap scan report for ${target}`,
        "Host is up (0.00012s latency).",
        "Not shown: 996 closed tcp ports (reset)",
        "PORT     STATE SERVICE",
        "22/tcp   open  ssh",
        "80/tcp   open  http",
        "443/tcp  open  https",
        "6379/tcp open  redis",
        `\nNmap done: 1 IP address (1 host up) scanned in 1.42 seconds`
      ];
      
      let stepIdx = 0;
      typingIntervalRef.current = setInterval(() => {
        if (stepIdx < steps.length) {
          playTickSound();
          setHistory(prev => [...prev, { type: 'output', text: steps[stepIdx] }]);
          stepIdx++;
        } else {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
          setTimeout(() => inputRef.current?.focus(), 10);
        }
      }, 400);
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
