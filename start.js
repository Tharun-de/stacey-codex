// Safe startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting the server in safe mode without automatic backups...');

// Set an environment variable to disable auto-backup
process.env.DISABLE_AUTO_BACKUP = 'true';

// Spawn the server process
const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
}); 