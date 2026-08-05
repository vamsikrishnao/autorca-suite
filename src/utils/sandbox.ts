export const FORBIDDEN_COMMAND_PATTERNS = [
  'rm -rf',
  'sudo',
  'curl ',
  'wget ',
  'chmod ',
  'mkfifo',
  '> /dev/',
  '| bash',
];

export function isForbiddenCommand(command: string): boolean {
  const lowerCmd = command.toLowerCase().trim();
  return FORBIDDEN_COMMAND_PATTERNS.some((pattern) => lowerCmd.includes(pattern));
}

export function validateSandboxCommand(command: string): {
  approved: boolean;
  error?: string;
  command: string;
} {
  if (isForbiddenCommand(command)) {
    return {
      approved: false,
      error: '[MICROVM SANDBOX VIOLATION] Command contains prohibited system calls or shell injection operators.',
      command,
    };
  }
  return {
    approved: true,
    command,
  };
}
