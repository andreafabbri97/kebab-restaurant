import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  ChefHat,
  CreditCard,
  BookOpen,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Nuovo Ordine', href: '/orders/new', icon: ShoppingCart },
  { name: 'Ordini', href: '/orders', icon: ChefHat },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Tavoli', href: '/tables', icon: CalendarDays },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Ricette', href: '/recipes', icon: BookOpen },
  { name: 'Personale', href: '/staff', icon: Users },
  { name: 'Report', href: '/reports', icon: BarChart3 },
  { name: 'SMAC', href: '/smac', icon: CreditCard },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900 border-r border-dark-700 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-dark-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Kebab</h1>
            <p className="text-xs text-dark-400">San Marino</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-dark-500 text-center">
          <p>Versione 2.0</p>
          <p className="mt-1">Made with React</p>
        </div>
      </div>
    </aside>
  );
}
