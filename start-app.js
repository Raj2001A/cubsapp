import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },

  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    import('net').then(({ default: net }) => {
      const server = net.createServer();

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(false);
      });

      server.listen(port);
    });
  });
}

// Function to start a process
function startProcess(name, command, args, cwd, env = {}) {
  console.log(`${colors.bright}${colors.fg.cyan}Starting ${name}...${colors.reset}`);

  const proc = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
    stdio: 'pipe'
  });

  // Add prefix to each line of output
  const prefix = `${colors.fg.cyan}[${name}]${colors.reset} `;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${prefix}${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${colors.fg.red}${prefix}${line}${colors.reset}`);
      }
    });
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`${colors.fg.red}${prefix}Process exited with code ${code}${colors.reset}`);
    } else {
      console.log(`${prefix}Process exited normally`);
    }
  });

  return proc;
}

// Main function to start all processes
async function main() {
  console.log(`${colors.bright}${colors.fg.green}Starting Employee Management App...${colors.reset}`);

  // Check if backend port is in use
  const backendPort = 5002;
  const backendInUse = await isPortInUse(backendPort);
  let backendProc;

  if (backendInUse) {
    console.log(`${colors.fg.yellow}Backend is already running on port ${backendPort}. Using existing backend.${colors.reset}`);
  } else {
    // Start backend only if it's not already running
    const backendPath = path.join(__dirname, 'employee-management-backend');
    backendProc = startProcess(
      'Backend',
      'npm',
      ['run', 'dev'],
      backendPath
    );

    // Wait for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Check if frontend port is in use
  const frontendPort = 3000;
  const frontendInUse = await isPortInUse(frontendPort);
  if (frontendInUse) {
    console.error(`${colors.fg.red}Error: Port ${frontendPort} is already in use. Frontend may already be running.${colors.reset}`);
    process.exit(1);
  }

  // Backend is started conditionally above

  // Start frontend
  const frontendPath = path.join(__dirname);
  const frontendProc = startProcess(
    'Frontend',
    'npm',
    ['run', 'dev'],
    frontendPath,
    { VITE_PORT: frontendPort }
  );

  // Handle process termination
  const cleanup = () => {
    console.log(`\n${colors.bright}${colors.fg.yellow}Shutting down all processes...${colors.reset}`);
    if (backendProc) {
      backendProc.kill();
    }
    frontendProc.kill();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  console.log(`\n${colors.bright}${colors.fg.green}All processes started successfully!${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}Backend running on: ${colors.fg.yellow}http://localhost:${backendPort}${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}Frontend running on: ${colors.fg.yellow}http://localhost:${frontendPort}${colors.reset}`);
  console.log(`\n${colors.bright}${colors.fg.magenta}Press Ctrl+C to stop all processes${colors.reset}`);
}

// Run the main function
main().catch(err => {
  console.error(`${colors.fg.red}Error starting application:${colors.reset}`, err);
  process.exit(1);
});
