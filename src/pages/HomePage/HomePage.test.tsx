import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import type {
  ManagedFolderItem,
  RuntimeInspection,
  RuntimeTaskRecord,
} from '../../services/runtime/runtime';

describe('HomePage', () => {
  const inspection: RuntimeInspection = {
    runtimeDriver: 'uv',
    defaultBackend: 'genie-tts',
    environment: {
      mode: 'cpu',
      torchAvailable: true,
      torchVersion: '2.6.0+cpu',
      cudaAvailable: false,
      issues: [],
    },
    availableBackends: ['genie-tts'],
    managedPaths: [
      { key: 'workspace', label: '根目录', path: '/repo' },
      { key: 'genieBase', label: 'Genie 基础资源', path: '/repo/models/genie/base' },
    ],
    resources: {
      'genie-base': {
        key: 'genie-base',
        label: 'GenieData 基础资源',
        status: 'missing',
        path: '/repo/models/genie/base/GenieData',
        missingPaths: ['speaker_encoder.onnx'],
      },
    },
    latestMessage: '运行驱动 uv，当前环境 CPU',
  };

  const folders: ManagedFolderItem[] = [
    { key: 'workspace', title: '根目录', path: '/repo', icon: '📁' },
    {
      key: 'genieBase',
      title: 'Genie 基础资源',
      path: '/repo/models/genie/base',
      icon: '🧠',
    },
  ];

  const tasks: RuntimeTaskRecord[] = [
    {
      taskId: 'task-1',
      target: 'genie-base',
      label: 'GenieData 基础资源',
      status: 'downloading',
      message: '正在下载',
      progressCurrent: 1,
      progressTotal: 3,
      updatedAt: '1712300001',
    },
  ];

  it('renders runtime summary, managed folders, and notice panel', () => {
    render(
      <HomePage
        inspection={inspection}
        tasks={tasks}
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
      screen.getByText('当前环境 CPU'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('GenieData 状态 missing'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('队列长度 1'),
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
        inspection={inspection}
        tasks={tasks}
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
