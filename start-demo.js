const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CyberXplore Demo...');

// Start the demo server
console.log('📡 Starting backend server...');
const backend = spawn('node', ['demo-server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Wait a bit then start the frontend
setTimeout(() => {
  console.log('🎨 Starting frontend...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});
