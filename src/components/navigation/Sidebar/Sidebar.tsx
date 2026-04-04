import huixinLogo from '../../../assets/brand/huixin-logo.svg';
import { NavItem } from '../NavItem/NavItem';
import type { NavItemData, PageId } from '../../../data/nav';

interface SidebarProps {
  items: NavItemData[];
  activePage: PageId;
  onSelect: (id: PageId) => void;
}

export function Sidebar({ items, activePage, onSelect }: SidebarProps) {
  const primaryItems = items.filter((item) => item.section === 'primary');
  const secondaryItems = items.filter((item) => item.section === 'secondary');

  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src={huixinLogo} alt="绘心 Logo" />
        <span>绘心</span>
      </div>

      <nav className="nav" aria-label="主导航">
        {primaryItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={item.id === activePage}
            onSelect={onSelect}
          />
        ))}

        <div className="nav-spacer" />

        {secondaryItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={item.id === activePage}
            onSelect={onSelect}
          />
        ))}
      </nav>
    </aside>
  );
}
