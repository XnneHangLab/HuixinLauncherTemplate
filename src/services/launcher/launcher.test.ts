import {
  buildLaunchToggleResult,
  formatConsoleExport,
  getVisibleCommand,
  launchButtonLabels,
  toggleLaunchState,
} from './launcher';

describe('launcher helpers', () => {
  it('toggles launch state between idle and running', () => {
    expect(toggleLaunchState('idle')).toBe('running');
    expect(toggleLaunchState('running')).toBe('idle');
  });

  it('falls back to 未配置命令 when no command is configured', () => {
    expect(getVisibleCommand(null)).toBe('未配置命令');
    expect(getVisibleCommand('')).toBe('未配置命令');
    expect(getVisibleCommand('uv run app.py')).toBe('uv run app.py');
  });

  it('creates launch transition logs for start and stop', () => {
    const startResult = buildLaunchToggleResult('idle', null);
    const stopResult = buildLaunchToggleResult('running', null);

    expect(startResult.nextState).toBe('running');
    expect(startResult.log.kind).toBe('system');
    expect(startResult.log.text).toBe('运行: 未配置命令');

    expect(stopResult.nextState).toBe('idle');
    expect(stopResult.log.text).toBe('已停止');
  });

  it('formats logs for export', () => {
    const output = formatConsoleExport([
      {
        id: 'log-1',
        time: '2026-04-04 15:00:00',
        kind: 'system',
        text: '运行: 未配置命令',
      },
    ]);

    expect(output).toContain('[system]');
    expect(output).toContain('运行: 未配置命令');
  });

  it('keeps launch button labels stable', () => {
    expect(launchButtonLabels.idle).toBe('▶ 一键启动');
    expect(launchButtonLabels.running).toBe('✈ 运行中');
  });
});
