import { spawn } from 'child_process';
import treeKill from 'tree-kill';

export const runDev = ({
  cwd,
  bin,
  command,
  port,
}: {
  cwd: string;
  bin: string;
  command: string;
  port: number;
}) => {
  return new Promise((resolve, reject) => {
    const instance = spawn('node', [bin, command], {
      cwd,
      env: {
        ...process.env,
        BROWSER: 'none',
        NODE_ENV: 'development',
        PORT: port.toString(),
      },
    });

    let didResolve = false;
    const onStdout = (data: any) => {
      const message = data.toString();
      if (
        message.includes('webpack compiled successfully') ||
        message.includes('compiled client and server successfully') ||
        message.includes('Compiled successfully') ||
        /ready\s+in\s+\d+\s+ms/.test(message)
      ) {
        if (!didResolve) {
          didResolve = true;
          resolve(instance);
        }
      }

      process.stdout.write(message);
    };

    const onStderr = (data: any) => {
      process.stderr.write(data.toString());
    };

    instance.stdout.on('data', onStdout);

    instance.stderr.on('data', onStderr);

    instance.on('close', () => {
      instance.stdout.removeListener('data', onStdout);
      instance.stderr.removeListener('data', onStderr);

      if (!didResolve) {
        didResolve = true;
        resolve(instance);
      }
    });

    instance.on('error', err => {
      reject(err);
    });
  });
};

export const sleep = (time: number = 4000) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), time));

export const killApp = (pid: number) => treeKill(pid, 'SIGKILL');
