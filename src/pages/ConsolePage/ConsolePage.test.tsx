import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ConsolePage } from './ConsolePage';

describe('ConsolePage', () => {
  it('renders the empty console state when no logs exist', () => {
    render(
      <ConsolePage
        launchState="idle"
        configuredCommand={null}
        logs={[]}
        autoScroll={true}
        wrapLines={true}
        onSetAutoScroll={() => undefined}
        onSetWrapLines={() => undefined}
        onClearLogs={() => undefined}
        onCopyLog={() => undefined}
        onExportLogs={() => undefined}
      />,
    );

    expect(screen.getByText('尚未启动任务')).toBeInTheDocument();
    expect(
      screen.getByText('点击首页一键启动后，这里会显示运行信息'),
    ).toBeInTheDocument();
    expect(screen.getByText('未配置命令')).toBeInTheDocument();
  });

  it('renders logs and triggers row/tool actions', async () => {
    const user = userEvent.setup();
    const onCopyLog = vi.fn();
    const onClearLogs = vi.fn();
    const onExportLogs = vi.fn();

    render(
      <ConsolePage
        launchState="running"
        configuredCommand={null}
        logs={[
          {
            id: 'log-1',
            time: '2026-04-04 15:00:00',
            kind: 'system',
            text: '运行: 未配置命令',
          },
        ]}
        autoScroll={true}
        wrapLines={true}
        onSetAutoScroll={() => undefined}
        onSetWrapLines={() => undefined}
        onClearLogs={onClearLogs}
        onCopyLog={onCopyLog}
        onExportLogs={onExportLogs}
      />,
    );

    expect(screen.getByText('运行: 未配置命令')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '复制日志 1' }));
    expect(onCopyLog).toHaveBeenCalledWith('运行: 未配置命令');

    await user.click(screen.getByRole('button', { name: '清空日志' }));
    expect(onClearLogs).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '导出日志' }));
    expect(onExportLogs).toHaveBeenCalled();
  });
});
