import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/navigation/Sidebar/Sidebar';
import { Topbar } from '../../components/window/Topbar/Topbar';
import { navItems, type PageId } from '../../data/nav';
import { renderPage } from '../../app/routes';
import {
  buildLaunchToggleResult,
  formatConsoleExport,
  type ConsoleLogEntry,
  type LaunchState,
} from '../../services/launcher/launcher';
import {
  readStoredTheme,
  toggleThemeMode,
  writeStoredTheme,
  type ThemeMode,
} from '../../services/theme/theme';

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme() ?? 'night');
  const [launchState, setLaunchState] = useState<LaunchState>('idle');
  const [configuredCommand] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);

  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  function handleToggleLaunchState() {
    const result = buildLaunchToggleResult(launchState, configuredCommand);
    setLaunchState(result.nextState);
    setLogs((currentLogs) => [...currentLogs, result.log]);
  }

  function handleClearLogs() {
    setLogs([]);
  }

  function handleCopyLog(text: string) {
    void navigator.clipboard?.writeText(text);
  }

  function handleExportLogs() {
    const output = formatConsoleExport(logs);
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'huixin-console.log';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="launcher-root" data-theme={theme}>
      <div className="app-shell">
        <Sidebar
          items={navItems}
          activePage={activePage}
          onSelect={setActivePage}
          theme={theme}
          onToggleTheme={() =>
            setTheme((current) => toggleThemeMode(current))
          }
        />

        <main className="content-shell">
          <Topbar />
          <section className="page-shell">
            {renderPage(activePage, {
              launchState,
              configuredCommand,
              logs,
              autoScroll,
              wrapLines,
              onToggleLaunchState: handleToggleLaunchState,
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
