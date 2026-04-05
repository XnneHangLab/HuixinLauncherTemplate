import type { ManagedFolderItem } from '../../../services/runtime/runtime';
import { FolderCard } from '../FolderCard/FolderCard';

interface FolderGridProps {
  items: ManagedFolderItem[];
  onOpen: (pathKey: string) => void;
}

export function FolderGrid({ items, onOpen }: FolderGridProps) {
  return (
    <div className="folder-grid">
      {items.map((item) => (
        <FolderCard key={item.key} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}
