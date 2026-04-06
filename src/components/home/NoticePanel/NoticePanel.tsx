interface NoticePanelProps {
  notices: string[];
  onOpenModels: () => void;
  onLaunchWebui: () => void;
}

export function NoticePanel({ notices, onOpenModels, onLaunchWebui }: NoticePanelProps) {
  return (
    <aside className="notice">
      <h2>公告</h2>

      {notices.map((notice) => (
        <p key={notice}>{notice}</p>
      ))}

      <button
        type="button"
        className="run-btn"
        data-state="ready"
        onClick={onLaunchWebui}
      >
        一键启动
      </button>
    </aside>
  );
}
