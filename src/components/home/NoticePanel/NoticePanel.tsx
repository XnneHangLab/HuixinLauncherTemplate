interface NoticePanelProps {
  notices: string[];
  runtimeMode: string;
  genieStatus: string;
  queueLength: number;
  latestMessage: string;
  onOpenModels: () => void;
}

const modeLabel: Record<string, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  checking: '检测中',
};

const genieStatusLabel: Record<string, string> = {
  ready: '已就绪',
  partial: '部分缺失',
  missing: '未下载',
};

export function NoticePanel({
  notices,
  runtimeMode,
  genieStatus,
  queueLength,
  latestMessage,
  onOpenModels,
}: NoticePanelProps) {
  const mode = modeLabel[runtimeMode] ?? runtimeMode;
  const genie = genieStatusLabel[genieStatus] ?? genieStatus;

  return (
    <aside className="notice">
      <h2>公告</h2>

      <div className="notice-status-bar">
        <span className="notice-status-chip" data-mode={runtimeMode}>
          <span className="notice-status-dot" aria-hidden="true" />
          {mode}
        </span>
        <span className="notice-status-chip">
          GenieData · {genie}
        </span>
        {queueLength > 0 ? (
          <span className="notice-status-chip notice-status-chip--queue">
            下载中 {queueLength}
          </span>
        ) : null}
        {latestMessage ? (
          <span className="notice-status-msg">{latestMessage}</span>
        ) : null}
      </div>

      {notices.map((notice) => (
        <p key={notice}>{notice}</p>
      ))}

      <button
        type="button"
        className="run-btn"
        data-state="ready"
        onClick={onOpenModels}
      >
        前往模型管理
      </button>
    </aside>
  );
}
