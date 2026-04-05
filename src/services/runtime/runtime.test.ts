import {
  applyRuntimeEvent,
  buildManagedFolderItems,
  createConsoleLogFromRuntimeEvent,
  type RuntimeInspection,
  type RuntimeTaskRecord,
} from './runtime';

describe('runtime helpers', () => {
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
      {
        key: 'modelscopeCache',
        label: 'ModelScope 缓存',
        path: '/repo/models/cache/modelscope',
      },
      { key: 'downloadLogs', label: '下载日志', path: '/repo/logs/downloads' },
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

  it('builds home folder items from managed paths', () => {
    expect(buildManagedFolderItems(inspection)).toEqual([
      { key: 'workspace', title: '根目录', path: '/repo', icon: '📁' },
      {
        key: 'genieBase',
        title: 'Genie 基础资源',
        path: '/repo/models/genie/base',
        icon: '🧠',
      },
      {
        key: 'modelscopeCache',
        title: 'ModelScope 缓存',
        path: '/repo/models/cache/modelscope',
        icon: '⬇',
      },
      { key: 'downloadLogs', title: '下载日志', path: '/repo/logs/downloads', icon: '🧾' },
    ]);
  });

  it('upserts task state from a runtime event', () => {
    const current: RuntimeTaskRecord[] = [];
    const next = applyRuntimeEvent(current, {
      event: 'download.progress',
      taskId: 'task-1',
      target: 'genie-base',
      status: 'downloading',
      message: '正在下载',
      progressCurrent: 1,
      progressTotal: 3,
      progressUnit: 'stage',
      timestamp: '1712300000',
    });

    expect(next).toEqual([
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
    ]);
  });

  it('converts runtime events into console lines', () => {
    const log = createConsoleLogFromRuntimeEvent({
      event: 'download.failed',
      taskId: 'task-1',
      target: 'genie-base',
      status: 'failed',
      message: 'network error',
      progressCurrent: 3,
      progressTotal: 3,
      progressUnit: 'stage',
      timestamp: '1712300000',
    });

    expect(log.kind).toBe('stderr');
    expect(log.text).toContain('network error');
  });
});
