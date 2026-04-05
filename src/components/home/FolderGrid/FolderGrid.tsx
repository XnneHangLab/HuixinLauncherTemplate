import { placeholderFolders } from '../../../data/home';
import type { ManagedFolderItem } from '../../../services/runtime/runtime';
import { FolderCard } from '../FolderCard/FolderCard';

interface FolderGridProps {
  items: ManagedFolderItem[];
  onOpen: (pathKey: string) => void;
}

export function FolderGrid({ items, onOpen }: FolderGridProps) {
  if (items.length > 0) {
    return (
      <div className="folder-grid">
        {items.map((item) => (
          <FolderCard key={item.key} item={item} onOpen={onOpen} />
        ))}
      </div>
    );
  }

  return (
    <div className="folder-grid">
      {placeholderFolders.map((item) => (
        <button
          key={item.key}
          type="button"
          className="folder-card folder-card--placeholder"
          disabled
          aria-label={item.title}
        >
          <span className="folder-left">
            <span className="folder-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="folder-text">
              <span className="folder-title">{item.title}</span>
              <span className="folder-sub">环境就绪后可用</span>
            </span>
          </span>
          <span className="arrow" aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  );
}
