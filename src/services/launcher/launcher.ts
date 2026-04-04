export type LaunchState = 'idle' | 'running';
export type ConsoleLogKind = 'system' | 'stdout' | 'stderr';

export interface ConsoleLogEntry {
  id: string;
  time: string;
  kind: ConsoleLogKind;
  text: string;
}

export const UNCONFIGURED_COMMAND_LABEL = '未配置命令';

export const launchButtonLabels: Record<LaunchState, string> = {
  idle: '▶ 一键启动',
  running: '✈ 运行中',
};

export function toggleLaunchState(currentState: LaunchState): LaunchState {
  return currentState === 'idle' ? 'running' : 'idle';
}

export function getVisibleCommand(command: string | null): string {
  const value = command?.trim();
  return value ? value : UNCONFIGURED_COMMAND_LABEL;
}

function createTimestamp() {
  const date = new Date();
  return date.toLocaleString('zh-CN', { hour12: false });
}

export function createConsoleLog(
  kind: ConsoleLogKind,
  text: string,
): ConsoleLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    time: createTimestamp(),
    kind,
    text,
  };
}

export function buildLaunchToggleResult(
  currentState: LaunchState,
  configuredCommand: string | null,
) {
  const nextState = toggleLaunchState(currentState);
  const logText =
    nextState === 'running'
      ? `运行: ${getVisibleCommand(configuredCommand)}`
      : '已停止';

  return {
    nextState,
    log: createConsoleLog('system', logText),
  };
}

export function formatConsoleExport(logs: ConsoleLogEntry[]) {
  return logs
    .map((entry) => `[${entry.time}] [${entry.kind}] ${entry.text}`)
    .join('\n');
}
