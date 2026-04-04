import type { ReactElement } from 'react';
import { HomePage } from '../pages/HomePage/HomePage';
import { ConsolePage } from '../pages/ConsolePage/ConsolePage';
import { PlaceholderPage } from '../pages/PlaceholderPage/PlaceholderPage';
import { SettingsPage } from '../pages/SettingsPage/SettingsPage';
import type { PageId } from '../data/nav';
import type {
  ConsoleLogEntry,
  LaunchState,
} from '../services/launcher/launcher';

interface RenderPageOptions {
  launchState: LaunchState;
  configuredCommand: string | null;
  logs: ConsoleLogEntry[];
  autoScroll: boolean;
  wrapLines: boolean;
  onToggleLaunchState: () => void;
  onSetAutoScroll: (next: boolean) => void;
  onSetWrapLines: (next: boolean) => void;
  onClearLogs: () => void;
  onCopyLog: (text: string) => void;
  onExportLogs: () => void;
}

export function renderPage(
  pageId: PageId,
  options: RenderPageOptions,
): ReactElement {
  switch (pageId) {
    case 'home':
      return (
        <HomePage
          launchState={options.launchState}
          onToggleLaunchState={options.onToggleLaunchState}
        />
      );
    case 'settings':
      return <SettingsPage />;
    case 'advanced':
      return (
        <PlaceholderPage
          title="高级选项"
          description="预留更细粒度的启动和环境参数配置。"
        />
      );
    case 'troubleshooting':
      return (
        <PlaceholderPage
          title="疑难解答"
          description="预留日志、诊断和修复入口。"
        />
      );
    case 'versions':
      return (
        <PlaceholderPage
          title="版本管理"
          description="预留多版本切换和回滚能力。"
        />
      );
    case 'models':
      return (
        <PlaceholderPage
          title="模型管理"
          description="预留模型浏览、下载和目录管理。"
        />
      );
    case 'tools':
      return (
        <PlaceholderPage
          title="小工具"
          description="预留常用工具和附加操作入口。"
        />
      );
    case 'community':
      return (
        <PlaceholderPage
          title="交流群"
          description="预留社区入口和外链跳转。"
        />
      );
    case 'console':
      return (
        <ConsolePage
          launchState={options.launchState}
          configuredCommand={options.configuredCommand}
          logs={options.logs}
          autoScroll={options.autoScroll}
          wrapLines={options.wrapLines}
          onSetAutoScroll={options.onSetAutoScroll}
          onSetWrapLines={options.onSetWrapLines}
          onClearLogs={options.onClearLogs}
          onCopyLog={options.onCopyLog}
          onExportLogs={options.onExportLogs}
        />
      );
    default: {
      const exhaustiveCheck: never = pageId;
      throw new Error(`Unhandled page id: ${exhaustiveCheck}`);
    }
  }
}
