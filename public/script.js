const socket = io();
const output = document.getElementById('output');
const inputLine = document.getElementById('input-line');

let isShift = false;
let isCtrl = false;
let isAlt = false;
let isCaps = false;

const keyMap = {
  '`': '`',
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  '-': '-', '=': '=',
  'q': 'q', 'w': 'w', 'e': 'e', 'r': 'r', 't': 't',
  'y': 'y', 'u': 'u', 'i': 'i', 'o': 'o', 'p': 'p',
  '[': '[', ']': ']', '\\': '\\',
  'a': 'a', 's': 's', 'd': 'd', 'f': 'f', 'g': 'g',
  'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l',
  ';': ';', "'": "'",
  'z': 'z', 'x': 'x', 'c': 'c', 'v': 'v', 'b': 'b',
  'n': 'n', 'm': 'm', ',': ',', '.': '.', '/': '/',
  ' ': ' '
};

const shiftMap = {
  '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
  '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
};

function sendKey(key) {
  let char = key;
  
  if (isShift && shiftMap[key]) {
    char = shiftMap[key];
  } else if (isShift) {
    char = key.toUpperCase();
  } else if (isCaps) {
    char = key.toUpperCase();
  }
  
  socket.emit('input', char);
}

function sendControlKey(keyName) {
  const controlKeys = {
    'esc': '\x1b',
    'tab': '\t',
    'enter': '\r',
    'backspace': '\x7f',
    'up': '\x1b[A',
    'down': '\x1b[B',
    'right': '\x1b[C',
    'left': '\x1b[D'
  };
  
  if (controlKeys[keyName]) {
    socket.emit('input', controlKeys[keyName]);
  }
}

document.querySelectorAll('.key').forEach(keyEl => {
  keyEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    keyEl.classList.add('pressed');
    
    const key = keyEl.dataset.key;
    
    if (key === 'shift') {
      isShift = !isShift;
      keyEl.classList.toggle('active', isShift);
      return;
    }
    
    if (key === 'caps') {
      isCaps = !isCaps;
      keyEl.classList.toggle('active', isCaps);
      return;
    }
    
    if (key === 'ctrl') {
      isCtrl = !isCtrl;
      keyEl.classList.toggle('active', isCtrl);
      return;
    }
    
    if (key === 'alt') {
      isAlt = !isAlt;
      keyEl.classList.toggle('active', isAlt);
      return;
    }
    
    if (key === 'backspace') {
      sendControlKey('backspace');
      return;
    }
    
    if (key === 'enter') {
      sendControlKey('enter');
      return;
    }
    
    if (key === 'tab') {
      sendControlKey('tab');
      return;
    }
    
    if (keyMap[key]) {
      sendKey(key);
    }
  });
  
  keyEl.addEventListener('mouseup', () => {
    keyEl.classList.remove('pressed');
  });
  
  keyEl.addEventListener('mouseleave', () => {
    keyEl.classList.remove('pressed');
  });
});

document.querySelectorAll('.toolbar-btn').forEach(btn => {
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const btnId = btn.id;
    
    if (btnId === 'btn-esc') {
      sendControlKey('esc');
    } else if (btnId === 'btn-tab') {
      sendControlKey('tab');
    } else if (btnId === 'btn-ctrl') {
      isCtrl = !isCtrl;
      btn.classList.toggle('active', isCtrl);
    } else if (btnId === 'btn-alt') {
      isAlt = !isAlt;
      btn.classList.toggle('active', isAlt);
    } else if (btnId === 'btn-shift') {
      isShift = !isShift;
      btn.classList.toggle('active', isShift);
    } else if (btnId === 'btn-up') {
      sendControlKey('up');
    } else if (btnId === 'btn-down') {
      sendControlKey('down');
    } else if (btnId === 'btn-left') {
      sendControlKey('left');
    } else if (btnId === 'btn-right') {
      sendControlKey('right');
    }
  });
});

inputLine.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    socket.emit('input', '\r');
  } else if (e.key === 'Backspace') {
    sendControlKey('backspace');
  } else if (e.key === 'Tab') {
    e.preventDefault();
    sendControlKey('tab');
  } else if (e.key === 'Escape') {
    sendControlKey('esc');
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    sendControlKey('up');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    sendControlKey('down');
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    sendControlKey('left');
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    sendControlKey('right');
  } else if (e.ctrlKey) {
    e.preventDefault();
    socket.emit('input', e.key.toLowerCase().charCodeAt(0) - 96);
  }
});

inputLine.addEventListener('input', (e) => {
  const text = e.target.value;
  if (text) {
    socket.emit('input', text);
    e.target.value = '';
  }
});

inputLine.addEventListener('click', () => {
  inputLine.focus();
});

socket.on('output', (data) => {
  output.textContent += data;
  output.scrollTop = output.scrollHeight;
});

document.addEventListener('keydown', (e) => {
  if (document.activeElement !== inputLine) {
    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
      inputLine.focus();
    }
  }
});

function resizeTerminal() {
  const terminalContainer = document.querySelector('.terminal-container');
  const cols = Math.floor(terminalContainer.clientWidth / 9);
  const rows = Math.floor(terminalContainer.clientHeight / 18);
  socket.emit('resize', { cols, rows });
}

window.addEventListener('resize', resizeTerminal);
resizeTerminal();
