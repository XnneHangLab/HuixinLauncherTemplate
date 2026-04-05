import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import type { ManagedFolderItem } from '../../services/runtime/runtime';

describe('HomePage', () => {
  const folders: ManagedFolderItem[] = [
    { key: 'workspace', title: '根目录', path: '/repo', icon: '📁' },
    {
      key: 'genieBase',
      title: 'Genie 基础资源',
      path: '/repo/models/genie/base',
      icon: '🧠',
    },
  ];

  it('renders managed folders and notice panel', () => {
    render(
      <HomePage
        folders={folders}
        onOpenPath={() => undefined}
        onOpenModels={() => undefined}
      />,
    );

    expect(
      screen.getByRole('heading', { name: '绘心 - 启动器' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '文件夹' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '公告' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开 根目录' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '打开 Genie 基础资源' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('启动器版本：绘心启动器 0.1.0'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('绘心是 XnneHangLab 正在持续迭代的启动器产品，也会沉淀为可复用模板，后续会逐步扩展到语音、模型管理与控制台能力。'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '前往模型管理' }),
    ).toBeInTheDocument();
  });

  it('opens managed paths and models page through callbacks', async () => {
    const user = userEvent.setup();
    const onOpenPath = vi.fn();
    const onOpenModels = vi.fn();

    render(
      <HomePage
        folders={folders}
        onOpenPath={onOpenPath}
        onOpenModels={onOpenModels}
      />,
    );

    await user.click(screen.getByRole('button', { name: '打开 Genie 基础资源' }));
    expect(onOpenPath).toHaveBeenCalledWith('genieBase');

    await user.click(screen.getByRole('button', { name: '前往模型管理' }));
    expect(onOpenModels).toHaveBeenCalledTimes(1);
  });
});
