import { useState } from 'react';
import { Sidebar } from '../../components/navigation/Sidebar/Sidebar';
import { Topbar } from '../../components/window/Topbar/Topbar';
import { navItems, type PageId } from '../../data/nav';
import { renderPage } from '../../app/routes';

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>('home');

  return (
    <div className="launcher-root">
      <div className="app-shell">
        <Sidebar
          items={navItems}
          activePage={activePage}
          onSelect={setActivePage}
        />

        <main className="content-shell">
          <Topbar title="UI 复刻预览" />
          <section className="page-shell">{renderPage(activePage)}</section>
        </main>
      </div>
    </div>
  );
}
