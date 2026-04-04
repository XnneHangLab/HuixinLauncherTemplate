interface NoticePanelProps {
  notices: string[];
  buttonLabel: string;
}

export function NoticePanel({ notices, buttonLabel }: NoticePanelProps) {
  return (
    <aside className="notice">
      <h2>公告</h2>

      {notices.map((notice) => (
        <p key={notice}>{notice}</p>
      ))}

      <button type="button" className="run-btn">
        {buttonLabel}
      </button>
    </aside>
  );
}
