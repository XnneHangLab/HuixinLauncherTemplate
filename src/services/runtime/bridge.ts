import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type {
  RuntimeEvent,
  RuntimeInspection,
  RuntimeTaskRecord,
} from './runtime';

export function inspectRuntime() {
  return invoke<RuntimeInspection>('inspect_runtime');
}

export function enqueueDownload(target: string) {
  return invoke<RuntimeTaskRecord>('enqueue_download', { target });
}

export function listDownloadTasks() {
  return invoke<RuntimeTaskRecord[]>('list_download_tasks');
}

export function openManagedPath(pathKey: string) {
  return invoke<void>('open_managed_path', { pathKey });
}

export function exportConsoleLogs(contents: string) {
  return invoke<string>('export_console_logs', { contents });
}

export async function subscribeRuntimeEvents(
  onEvent: (event: RuntimeEvent) => void,
  onRawLog: (line: string) => void,
) {
  const unlistenCallbacks: Array<() => void> = [];

  try {
    const unlistenEvent = await listen<RuntimeEvent>('runtime:event', (event) => {
      onEvent(event.payload);
    });
    unlistenCallbacks.push(unlistenEvent);

    const unlistenRaw = await listen<string>('runtime:raw-log', (event) => {
      onRawLog(event.payload);
    });
    unlistenCallbacks.push(unlistenRaw);
  } catch (error) {
    unlistenCallbacks.forEach((cleanup) => cleanup());
    throw error;
  }

  return () => {
    unlistenCallbacks.forEach((cleanup) => cleanup());
  };
}
