import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ModelsPage } from './ModelsPage';

describe('ModelsPage', () => {
  it('renders the genie resource card and queue entries', async () => {
    const user = userEvent.setup();
    const onDownloadGenieBase = vi.fn();
    const onOpenPath = vi.fn();

    render(
      <ModelsPage
        inspection={{
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
        }}
        tasks={[
          {
            taskId: 'task-1',
            target: 'genie-base',
            label: 'GenieData 基础资源',
            status: 'downloading',
            message: '正在下载',
            progressCurrent: 1,
            progressTotal: 3,
            updatedAt: '1712300000',
          },
        ]}
        onDownloadGenieBase={onDownloadGenieBase}
        onOpenPath={onOpenPath}
        scriptsReady
      />,
    );

    expect(screen.getByRole('heading', { name: '模型管理' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'GenieData 基础资源' }),
    ).toBeInTheDocument();
    expect(screen.getByText('状态 missing')).toBeInTheDocument();
    expect(screen.getByText('正在下载')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '下载 GenieData' }));
    expect(onDownloadGenieBase).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '打开 Genie 目录' }));
    expect(onOpenPath).toHaveBeenCalledWith('genieBase');
  });

  it('disables download action when runtime scripts are blocked', () => {
    render(
      <ModelsPage
        inspection={null}
        tasks={[]}
        onDownloadGenieBase={() => undefined}
        onOpenPath={() => undefined}
        scriptsReady={false}
      />,
    );

    expect(screen.getByRole('button', { name: '下载 GenieData' })).toBeDisabled();
    expect(screen.getByText('环境未就绪，暂不允许执行下载脚本。')).toBeInTheDocument();
  });
});
