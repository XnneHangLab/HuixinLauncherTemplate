interface NoticePanelProps {
  notices: string[];
  runtimeMode: string;
  genieStatus: string;
  queueLength: number;
  latestMessage: string;
  onOpenModels: () => void;
}

export function NoticePanel({
  notices,
  runtimeMode,
  genieStatus,
  queueLength,
  latestMessage,
  onOpenModels,
}: NoticePanelProps) {
  return (
    <aside className="notice">
      <h2>公告</h2>
      <p>当前环境 {runtimeMode.toUpperCase()}</p>
      <p>GenieData 状态 {genieStatus}</p>
      <p>队列长度 {queueLength}</p>
      <p>{latestMessage}</p>

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
