const fs = require('fs');

let file = fs.readFileSync('src/components/InteractiveTerminal.jsx', 'utf8');

const newCommands = `const commandsList = {
  sudo: 'rajesh is not in the sudoers file. This incident will be reported to Santa Claus.',
  date: new Date().toString(),
  whoami: 'rajesh (root access denied)',
  help: 'Available commands:\\n- about     : Who is Rajesh?\\n- skills    : Tech stack & tools\\n- projects  : Featured work\\n- contact   : How to reach me\\n- email     : Send me a direct email\\n- clear     : Clear terminal output\\n- date      : Current system date\\n- sudo      : Superuser access\\n- echo      : Repeat after me\\n- whoami    : Print current user\\n- status    : System health check\\n- neofetch  : System information\\n- ifconfig  : Network interfaces\\n- matrix    : Follow the white rabbit',
  about: 'Rajesh Pandit - Backend Engineer.\\nI build distributed infrastructure, real-time platforms, and APIs engineered to handle massive concurrency. I think in systems — not just code.',
  skills: 'Backend: Node.js, Python, C++, Go\\nDatabases: MongoDB, PostgreSQL, Redis\\nArchitecture: Microservices, WebSockets, Pub/Sub\\nCloud: AWS, Docker, Kubernetes',
  projects: '1. NexusChat - Real-time scalable messaging system\\n2. LibraTech - Advanced library management API\\n3. AirBNB Clone - Full-stack booking platform\\n4. CodeJudge - Auto-evaluating competitive platform',
  contact: 'Email: rashq122@gmail.com\\nGitHub: https://github.com/rashq-01\\nLinkedIn: https://linkedin.com/in/rashq\\nX: @rashq_01',
  email: 'rashq122@gmail.com',
  matrix: 'Wake up, Rajesh...\\nThe Matrix has you...\\nFollow the white rabbit.\\nKnock, knock.',
  ifconfig: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\\n        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255\\n        inet6 fe80::215:5dff:fe00:1234  prefixlen 64  scopeid 0x20<link>\\n        RX packets 1450012  bytes 8452140 (8.4 MB)\\n        TX packets 8541012  bytes 105423140 (105.4 MB)\\n\\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\\n        inet 127.0.0.1  netmask 255.0.0.0\\n        RX packets 24102  bytes 2400120 (2.4 MB)\\n        TX packets 24102  bytes 2400120 (2.4 MB)',
  status: 'System checks:\\n[OK] Database connection active\\n[OK] Redis cache operational\\n[OK] API endpoints stable\\n[OK] Message broker running\\n\\nAll systems operational. Uptime: 99.99%',
  neofetch: '       .---.\\n      /     \\\\\\n     \\\\.@-@./\\n     /\\`\\\\_/\\`\\\\\\n    //  _  \\\\\\\\\\n   | \\\\     / |\\n  /\\`\\\\_\\`>  <_/\\`\\\\\\n  \\\\__/\\\\'---\\\\'\\\\__/\\n\\nOS: Kali Linux x86_64\\nHost: Rajesh-Server\\nKernel: 6.8.11-amd64\\nUptime: 24 days, 7 hours\\nPackages: 2408 (dpkg)\\nShell: bash 5.2.21\\nTerminal: Web Term'
};`;

file = file.replace(/const commandsList = \{[\s\S]*?\n\};\n/, newCommands + '\n');
fs.writeFileSync('src/components/InteractiveTerminal.jsx', file);
