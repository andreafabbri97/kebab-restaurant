import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLowStockItems } from '../../lib/database';

export function Layout() {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Check low stock
    getLowStockItems().then(items => {
      setLowStockCount(items.length);
    });

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />

      {/* Main content */}
      <div className="pl-64">
        {/* Header - Compact */}
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Cerca..."
                className="input pl-9 py-1.5 text-sm"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Time - Inline */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-white">
                  {currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-dark-400">
                  {currentTime.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-dark-800 rounded-lg transition-colors">
                <Bell className="w-4 h-4 text-dark-300" />
                {lowStockCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {lowStockCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
