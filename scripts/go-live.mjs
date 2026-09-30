import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = path.join(root, 'server');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (args, cwd = root) => {
  const result = spawnSync(npm, args, { cwd, stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const apiReady = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/health');
    return response.ok;
  } catch {
    return false;
  }
};

if (!existsSync(path.join(root, 'node_modules'))) {
  console.log('[Aurel] Installing frontend dependencies…');
  run(['install', '--no-audit', '--no-fund']);
}
if (!existsSync(path.join(server, 'node_modules'))) {
  console.log('[Aurel] Installing API dependencies…');
  run(['install', '--no-audit', '--no-fund'], server);
}

console.log('[Aurel] Preparing the Go Live build…');
run(['run', 'build']);

if (await apiReady()) {
  console.log('[Aurel] API is already running on http://localhost:5000');
  setInterval(() => {}, 60_000);
} else {
  console.log('[Aurel] Starting the API on http://localhost:5000');
  const child = spawn(npm, ['start'], { cwd: server, stdio: 'inherit', shell: false });
  child.on('exit', (code) => process.exit(code ?? 0));
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  await delay(250);
}
