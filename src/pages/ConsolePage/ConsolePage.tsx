import type {
  ConsoleLogEntry,
  LaunchState,
} from '../../services/launcher/launcher';
import { getVisibleCommand } from '../../services/launcher/launcher';
import '../../styles/console.css';

interface ConsolePageProps {
  launchState: LaunchState;
  configuredCommand: string | null;
  logs: ConsoleLogEntry[];
  autoScroll: boolean;
  wrapLines: boolean;
  onSetAutoScroll: (next: boolean) => void;
  onSetWrapLines: (next: boolean) => void;
  onClearLogs: () => void;
  onCopyLog: (text: string) => void;
  onExportLogs: () => void;
}

export function ConsolePage({
  launchState,
  configuredCommand,
  logs,
  autoScroll,
  wrapLines,
  onSetAutoScroll,
  onSetWrapLines,
  onClearLogs,
  onCopyLog,
  onExportLogs,
}: ConsolePageProps) {
  const visibleCommand = getVisibleCommand(configuredCommand);
  const lastLog = logs[logs.length - 1];

  return (
    <div className="console-page">
      <header className="console-toolbar">
        <div className="console-toolbar__status">
          <span className={`console-status console-status--${launchState}`}>
            {launchState === 'running' ? '运行中' : '空闲'}
          </span>
          <div className="console-toolbar__meta">
            <span className="console-toolbar__label">当前命令</span>
            <span className="console-command">{visibleCommand}</span>
          </div>
        </div>

        <div className="console-toolbar__actions">
          <button type="button" onClick={onClearLogs}>
            清空日志
          </button>
          <button type="button" onClick={onExportLogs}>
            导出日志
          </button>
          <button
            type="button"
            aria-pressed={autoScroll}
            onClick={() => onSetAutoScroll(!autoScroll)}
          >
            自动滚动
          </button>
          <button
            type="button"
            aria-pressed={wrapLines}
            onClick={() => onSetWrapLines(!wrapLines)}
          >
            换行
          </button>
        </div>
      </header>

      <section className={`console-log-panel${wrapLines ? ' is-wrap' : ''}`}>
        {logs.length === 0 ? (
          <div className="console-empty">
            <h2>尚未启动任务</h2>
            <p>点击首页一键启动后，这里会显示运行信息</p>
          </div>
        ) : (
          <div className="console-log-list">
            {logs.map((entry, index) => (
              <article
                key={entry.id}
                className={`console-log console-log--${entry.kind}`}
              >
                <div className="console-log__meta">
                  <span>{entry.time}</span>
                  <span>{entry.kind}</span>
                </div>
                <pre className="console-log__text">{entry.text}</pre>
                <button
                  type="button"
                  className="console-log__copy"
                  aria-label={`复制日志 ${index + 1}`}
                  onClick={() => onCopyLog(entry.text)}
                >
                  复制
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="console-footer">
        <span>日志条数 {logs.length}</span>
        <span>最后更新时间 {lastLog ? lastLog.time : '暂无'}</span>
        <span>{autoScroll ? '自动滚动开启' : '自动滚动关闭'}</span>
      </footer>
    </div>
  );
}
