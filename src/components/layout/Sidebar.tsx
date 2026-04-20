import { NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { menuItems, sidebarHiddenPaths } from '../../utils/dashboardConfig';
import type { MenuItem } from '../../utils/dashboardConfig';

interface MenuIconProps {
  path: string;
}

interface SidebarProps {
  activeRecords: number;
  isAnimating: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const MenuIcon = ({ path }: MenuIconProps) => {
  const commonProps = {
    'aria-hidden': true,
    className: 'menu-icon-svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (path) {
    case '/':
      return (
        <svg {...commonProps}>
          <path d="M3 12.5 12 4l9 8.5" />
          <path d="M5.5 10.5V20h13V10.5" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      );
    case '/interviews':
      return (
        <svg {...commonProps}>
          <rect x="4" y="5" width="16" height="15" rx="2.5" />
          <path d="M8 3v4M16 3v4M4 9h16" />
          <path d="M8 13h3M8 16h5" />
        </svg>
      );
    case '/pipeline':
      return (
        <svg {...commonProps}>
          <path d="M5 6h14" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
          <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="10" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case '/master-report':
      return (
        <svg {...commonProps}>
          <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 3Z" />
          <path d="M14 3v5h5" />
          <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
        </svg>
      );
    case '/recruiter':
    case '/recruiter/all':
    case '/recruiter/todo':
      return (
        <svg {...commonProps}>
          <path d="M16.5 21v-2a3.5 3.5 0 0 0-3.5-3.5h-2A3.5 3.5 0 0 0 7.5 19v2" />
          <circle cx="12" cy="8" r="3.5" />
          <path d="M18.5 8.5h4M20.5 6.5v4" />
        </svg>
      );
    case '/sales':
    case '/sales/all':
    case '/sales/todo':
      return (
        <svg {...commonProps}>
          <path d="M4 18.5h16" />
          <path d="M7 18.5V8.5l5-3 5 3v10" />
          <path d="M10 12h4" />
          <path d="M12 9.5v5" />
        </svg>
      );
    case '/settings':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1.7 1.7 0 1 1-3.4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1.7 1.7 0 1 1 0-3.4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1 1 0 0 0 1.1.2H9.5a1 1 0 0 0 .6-.9V5a1.7 1.7 0 1 1 3.4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.2a1.7 1.7 0 1 1 0 3.4h-.2a1 1 0 0 0-.9.6Z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
};

function Sidebar({
  activeRecords,
  isAnimating,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const handleLogout = () => {
    void dispatch(logout());
  };

  const isGroupActive = (item: MenuItem) =>
    item.path === location.pathname ||
    item.children?.some((child) => child.path === location.pathname) === true;

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${
        isAnimating ? 'sidebar-bubble' : ''
      }`}
    >
      <div className="sidebar-top">
        <div className="sidebar-heading">
          <p className="sidebar-brand">{isCollapsed ? 'BRI' : 'BRI Internal'}</p>
          {!isCollapsed && <h2 className="sidebar-title">Recruitment Menu</h2>}
          {!isCollapsed && (
            <p className="sidebar-copy">
              Navigasi cepat untuk dashboard interview dan monitoring kandidat.
            </p>
          )}
        </div>

        <button
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="sidebar-toggle"
          type="button"
          onClick={onToggle}
        >
          <span className={`sidebar-toggle-icon ${isCollapsed ? 'rotated' : ''}`}>
            {'<'}
          </span>
        </button>
      </div>

      <nav className="sidebar-menu" aria-label="Main navigation">
        {menuItems
          .filter((item) => !sidebarHiddenPaths.has(item.path))
          .map((item) => {
          const groupActive = isGroupActive(item);

          return (
            <div
              className={`menu-group ${groupActive ? 'menu-group-open' : ''}`}
              key={item.path}
            >
              <NavLink
                className={`menu-item ${groupActive ? 'menu-item-active' : ''}`}
                to={item.path}
                title={item.label}
              >
                <span className="menu-item-icon">
                  <MenuIcon path={item.path} />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="menu-item-copy">
                      <span>{item.label}</span>
                      <small>{item.meta}</small>
                    </span>
                    {item.children?.length ? (
                      <span
                        aria-hidden="true"
                        className={`menu-expand-arrow ${
                          groupActive ? 'menu-expand-arrow-open' : ''
                        }`}
                      >
                        <svg viewBox="0 0 20 20" fill="none">
                          <path
                            d="M5 7.5 10 12.5l5-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>

              {!isCollapsed && item.children?.length ? (
                <div className="submenu-list">
                  <div className="submenu-list-inner">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        className={({ isActive }) =>
                          `submenu-item ${isActive ? 'submenu-item-active' : ''}`
                        }
                        to={child.path}
                      >
                        <span>{child.label}</span>
                        <small>{child.meta}</small>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && user ? (
          <div className="sidebar-user-card">
            <strong>{user.fullName}</strong>
            <span>{user.role.replace('_', ' ')}</span>
            <small>{user.email}</small>
          </div>
        ) : null}
        {!isCollapsed && <span>Active records</span>}
        <strong>{activeRecords}</strong>
        {!isCollapsed && <small>Data yang sedang tampil setelah filter</small>}
        {!isCollapsed ? (
          <button className="sidebar-logout-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default Sidebar;
