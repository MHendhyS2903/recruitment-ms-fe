import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import type { DashboardLayoutProps } from '../types/dashboard';

function DashboardLayout({ activeRecords, children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
  });
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      'dashboard-sidebar-collapsed',
      String(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isSidebarAnimating) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsSidebarAnimating(false);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [isSidebarAnimating]);

  const handleSidebarToggle = () => {
    setIsSidebarAnimating(true);
    setIsSidebarCollapsed((current) => !current);
  };

  return (
    <div className="app-shell">
      <div
        className={`layout-shell ${isSidebarCollapsed ? 'layout-shell-collapsed' : ''}`}
      >
        <Sidebar
          activeRecords={activeRecords}
          isAnimating={isSidebarAnimating}
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
