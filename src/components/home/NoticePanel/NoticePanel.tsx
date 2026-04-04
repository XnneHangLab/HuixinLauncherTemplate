import type { LaunchState } from '../../../services/launcher/launcher';

interface NoticePanelProps {
  notices: string[];
  buttonLabel: string;
  launchState: LaunchState;
  onLaunch: () => void;
}

export function NoticePanel({
  notices,
  buttonLabel,
  launchState,
  onLaunch,
}: NoticePanelProps) {
  return (
    <aside className="notice">
      <h2>公告</h2>

      {notices.map((notice) => (
        <p key={notice}>{notice}</p>
      ))}

      <button
        type="button"
        className="run-btn"
        data-state={launchState}
        onClick={onLaunch}
      >
        {buttonLabel}
      </button>
    </aside>
  );
}
