import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('renders settings controls and switches tabs', async () => {
    const user = userEvent.setup();
    const onChooseWorkspaceRoot = vi.fn();
    const onUseRepoWorkspaceRoot = vi.fn();

    render(
      <SettingsPage
        workspaceRoot="/repo"
        workspaceLocked={false}
        environmentProbe={{
          workspaceRoot: '/repo',
          repoRoot: '/repo',
          status: 'torch-cpu-ready',
          mode: 'cpu',
          torchAvailable: true,
          torchVersion: '2.6.0+cpu',
          cudaAvailable: false,
          issues: [],
          message: 'torch 已就绪: CPU',
        }}
        onChooseWorkspaceRoot={onChooseWorkspaceRoot}
        onUseRepoWorkspaceRoot={onUseRepoWorkspaceRoot}
        pythonPath=""
      />,
    );

    expect(
      screen.getByRole('tab', { name: '一般设置', selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'id',
      'settings-tab-general',
    );
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'aria-controls',
      'settings-panel-general',
    );
    expect(screen.getByRole('tabpanel', { name: '一般设置' })).toHaveAttribute(
      'id',
      'settings-panel-general',
    );
    expect(screen.getByLabelText('工作目录路径')).toHaveValue('/repo');
    expect(screen.getByText('CPU 就绪')).toBeInTheDocument();
    expect(screen.getByLabelText('代理服务器地址')).toHaveValue(
      'http://127.0.0.1:xxxx',
    );
    expect(
      screen.getByRole('button', { name: '将代理应用到 Git' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '更改目录' }));
    expect(onChooseWorkspaceRoot).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '重置为项目目录' }));
    expect(onUseRepoWorkspaceRoot).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('tab', { name: '关于' }));
    expect(screen.getByRole('tabpanel', { name: '关于' })).toHaveAttribute(
      'id',
      'settings-panel-about',
    );
    expect(
      screen.getByText('XnneHangLab Launcher Template'),
    ).toBeInTheDocument();
  });

  it('disables workspace switching while queue is active', () => {
    render(
      <SettingsPage
        workspaceRoot="/repo"
        workspaceLocked
        environmentProbe={{
          workspaceRoot: '/repo',
          repoRoot: '/repo',
          status: 'torch-unavailable',
          mode: null,
          torchAvailable: false,
          torchVersion: null,
          cudaAvailable: false,
          issues: ['No module named torch'],
          message: 'torch 不可用',
        }}
        onChooseWorkspaceRoot={() => undefined}
        onUseRepoWorkspaceRoot={() => undefined}
        pythonPath=""
      />,
    );

    expect(screen.getByRole('button', { name: '更改目录' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '重置为项目目录' })).toBeDisabled();
  });
});
