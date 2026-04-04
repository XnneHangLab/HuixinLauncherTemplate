import type { LaunchButtonState } from '../../../data/home';

interface NoticePanelProps {
  notices: string[];
  buttonLabel: string;
  launchState: LaunchButtonState;
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
        disabled={launchState === 'running'}
        onClick={onLaunch}
      >
        {buttonLabel}
      </button>
    </aside>
  );
}
