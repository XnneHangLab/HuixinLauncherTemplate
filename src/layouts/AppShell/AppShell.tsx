import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/navigation/Sidebar/Sidebar';
import { Topbar } from '../../components/window/Topbar/Topbar';
import { navItems, type PageId } from '../../data/nav';
import { renderPage } from '../../app/routes';
import {
  createConsoleLog,
  formatConsoleExport,
  type ConsoleLogEntry,
} from '../../services/launcher/launcher';
import {
  enqueueDownload,
  exportConsoleLogs,
  inspectRuntime,
  listDownloadTasks,
  openManagedPath,
  subscribeRuntimeEvents,
} from '../../services/runtime/bridge';
import {
  applyRuntimeEvent,
  buildManagedFolderItems,
  createConsoleLogFromRuntimeEvent,
  type ManagedFolderItem,
  type RuntimeInspection,
  type RuntimeTaskRecord,
} from '../../services/runtime/runtime';
import {
  readStoredTheme,
  toggleThemeMode,
  writeStoredTheme,
  type ThemeMode,
} from '../../services/theme/theme';

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme() ?? 'night');
  const [inspection, setInspection] = useState<RuntimeInspection | null>(null);
  const [tasks, setTasks] = useState<RuntimeTaskRecord[]>([]);
  const [folders, setFolders] = useState<ManagedFolderItem[]>([]);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);

  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};

    void (async () => {
      try {
        const [nextInspection, nextTasks] = await Promise.all([
          inspectRuntime(),
          listDownloadTasks(),
        ]);
        if (disposed) {
          return;
        }
        setInspection(nextInspection);
        setFolders(buildManagedFolderItems(nextInspection));
        setTasks(nextTasks);
      } catch (error) {
        if (disposed) {
          return;
        }
        setLogs((current) => [
          ...current,
          createConsoleLog('stderr', `初始化运行时失败: ${toErrorMessage(error)}`),
        ]);
      }
    })();

    void subscribeRuntimeEvents(
      (event) => {
        setTasks((current) => applyRuntimeEvent(current, event));
        setLogs((current) => [...current, createConsoleLogFromRuntimeEvent(event)]);
      },
      (line) => {
        setLogs((current) => [...current, createConsoleLog('stdout', line)]);
      },
    )
      .then((cleanup) => {
        if (disposed) {
          cleanup();
          return;
        }
        unsubscribe = cleanup;
      })
      .catch((error) => {
        if (disposed) {
          return;
        }
        setLogs((current) => [
          ...current,
          createConsoleLog('stderr', `订阅运行时事件失败: ${toErrorMessage(error)}`),
        ]);
      });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  async function handleDownloadGenieBase() {
    try {
      const task = await enqueueDownload('genie-base');
      setTasks((current) => {
        const next = current.filter((item) => item.taskId !== task.taskId);
        next.push(task);
        return next;
      });
      setLogs((current) => [
        ...current,
        createConsoleLog('system', `${task.label}: ${task.message}`),
      ]);
      setActivePage('models');
    } catch (error) {
      setLogs((current) => [
        ...current,
        createConsoleLog('stderr', `创建下载任务失败: ${toErrorMessage(error)}`),
      ]);
    }
  }

  async function handleOpenManagedPath(pathKey: string) {
    try {
      await openManagedPath(pathKey);
    } catch (error) {
      setLogs((current) => [
        ...current,
        createConsoleLog('stderr', `打开目录失败: ${toErrorMessage(error)}`),
      ]);
    }
  }

  async function handleExportLogs() {
    try {
      const output = formatConsoleExport(logs);
      const path = await exportConsoleLogs(output);
      setLogs((current) => [
        ...current,
        createConsoleLog('system', `日志已导出到 ${path}`),
      ]);
    } catch (error) {
      setLogs((current) => [
        ...current,
        createConsoleLog('stderr', `导出日志失败: ${toErrorMessage(error)}`),
      ]);
    }
  }

  function handleCopyLog(text: string) {
    void navigator.clipboard?.writeText(text);
  }

  function handleClearLogs() {
    setLogs([]);
  }

  return (
    <div className="launcher-root" data-theme={theme}>
      <div className="app-shell">
        <Sidebar
          items={navItems}
          activePage={activePage}
          onSelect={setActivePage}
          theme={theme}
          onToggleTheme={() => setTheme((current) => toggleThemeMode(current))}
        />

        <main className="content-shell">
          <Topbar />
          <section className="page-shell">
            {renderPage(activePage, {
              inspection,
              tasks,
              folders,
              logs,
              autoScroll,
              wrapLines,
              onOpenModels: () => setActivePage('models'),
              onDownloadGenieBase: handleDownloadGenieBase,
              onOpenPath: handleOpenManagedPath,
              runtimeDriver: inspection?.runtimeDriver ?? 'uv',
              pythonPath: '',
              onSetAutoScroll: setAutoScroll,
              onSetWrapLines: setWrapLines,
              onClearLogs: handleClearLogs,
              onCopyLog: handleCopyLog,
              onExportLogs: handleExportLogs,
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
