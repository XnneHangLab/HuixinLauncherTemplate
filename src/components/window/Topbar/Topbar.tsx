import { WindowControls } from '../WindowControls/WindowControls';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-title" data-tauri-drag-region>
        {title}
      </div>
      <div className="topbar-right">
        <div className="topbar-help">?</div>
        <WindowControls />
      </div>
    </header>
  );
}
