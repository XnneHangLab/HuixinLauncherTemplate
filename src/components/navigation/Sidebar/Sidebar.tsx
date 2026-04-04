import huixinLogo from '../../../assets/brand/huixin-logo.svg';
import { NavItem } from '../NavItem/NavItem';
import type { NavItemData, PageId } from '../../../data/nav';
import type { ThemeMode } from '../../../services/theme/theme';

interface SidebarProps {
  items: NavItemData[];
  activePage: PageId;
  onSelect: (id: PageId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Sidebar({
  items,
  activePage,
  onSelect,
  theme,
  onToggleTheme,
}: SidebarProps) {
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

        {secondaryItems.map((item) => {
          const isLightbulb = item.id === 'ideas';
          const handleSelect = (id: PageId) => {
            if (isLightbulb) {
              onToggleTheme();
              return;
            }
            onSelect(id);
          };

          return (
            <NavItem
              key={item.id}
              item={item}
              active={isLightbulb ? theme === 'day' : item.id === activePage}
              onSelect={handleSelect}
            />
          );
        })}
      </nav>
    </aside>
  );
}
