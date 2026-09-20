import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  FolderTree,
  PiggyBank,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Wallet, label: 'Расходы', path: '/expenses' },
  { icon: FolderTree, label: 'Категории', path: '/categories' },
  { icon: PiggyBank, label: 'Бюджеты', path: '/budgets' },
  { icon: BarChart3, label: 'Аналитика', path: '/analytics' },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};
