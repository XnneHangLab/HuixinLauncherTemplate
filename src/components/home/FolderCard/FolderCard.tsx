import type { FolderItem } from '../../../data/home';

interface FolderCardProps {
  item: FolderItem;
}

export function FolderCard({ item }: FolderCardProps) {
  return (
    <button
      type="button"
      className="folder-card"
      aria-label={`打开 ${item.title}`}
    >
      <span className="folder-left">
        <span className="folder-icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="folder-text">
          <span className="folder-title">{item.title}</span>
          <span className="folder-sub">{item.path}</span>
        </span>
      </span>

      <span className="arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
