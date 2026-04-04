import type { FolderItem } from '../../../data/home';
import { FolderCard } from '../FolderCard/FolderCard';

interface FolderGridProps {
  items: FolderItem[];
}

export function FolderGrid({ items }: FolderGridProps) {
  return (
    <div className="folder-grid">
      {items.map((item) => (
        <FolderCard key={item.title} item={item} />
      ))}
    </div>
  );
}
