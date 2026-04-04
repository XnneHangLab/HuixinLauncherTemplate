import type { NavItemData, PageId } from '../../../data/nav';

interface NavItemProps {
  item: NavItemData;
  active: boolean;
  onSelect: (id: PageId) => void;
}

export function NavItem({ item, active, onSelect }: NavItemProps) {
  return (
    <button
      type="button"
      className={`nav-item${active ? ' active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(item.id)}
    >
      <span className="nav-icon" aria-hidden="true">
        {item.icon}
      </span>
      <span>{item.label}</span>
    </button>
  );
}
