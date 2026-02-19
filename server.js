const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let terminal = null;

io.on('connection', (socket) => {
  console.log('Client connected');

  if (!terminal) {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    terminal = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.env.USERPROFILE || '/home/coder',
      env: process.env
    });
  }

  terminal.onData((data) => {
    socket.emit('output', data);
  });

  socket.on('input', (data) => {
    if (terminal) {
      terminal.write(data);
    }
  });

  socket.on('resize', (data) => {
    if (terminal) {
      terminal.resize(data.cols, data.rows);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
